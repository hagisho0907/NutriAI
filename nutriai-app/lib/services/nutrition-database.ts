import type { FoodItem, VisionAnalysisResult } from './vision';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const canUseSupabase = Boolean(supabaseUrl && supabaseServiceRoleKey);
const supabaseRestEndpoint = canUseSupabase
  ? `${supabaseUrl.replace(/\/$/, '')}/rest/v1/jfct_foods`
  : null;

interface JfctFoodRow {
  food_code: string;
  name_ja: string;
  energy_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
}

export async function enrichVisionResultWithDatabase(
  result: VisionAnalysisResult
): Promise<VisionAnalysisResult> {
  console.log('🥗 栄養突合: 開始', {
    canUseSupabase,
    supabaseConfigured: Boolean(supabaseRestEndpoint)
  });

  if (!canUseSupabase || !supabaseRestEndpoint) {
    console.warn('🥗 栄養突合: Supabase未設定のためGemini結果を返却');
    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        source: item.source ?? 'gemini',
      })),
    };
  }

  const enrichedItems = await Promise.all(
    result.items.map(async (item) => {
      console.log('🥗 栄養突合: Gemini出力を処理', {
        name: item.name,
        quantity: item.quantity,
        provider: item.source
      });

      const match = await findBestMatch(item.name);
      if (!match) {
        console.warn('🥗 栄養突合: マッチなし', { originalName: item.name });
        return {
          ...item,
          source: item.source ?? 'gemini',
        };
      }

      console.log('🥗 栄養突合: マッチ成功', {
        originalName: item.name,
        matchedName: match.name_ja,
        foodCode: match.food_code
      });

      const multiplier =
        item.quantity && item.quantity > 0 ? item.quantity / 100 : 1;

      const calories =
        match.energy_kcal != null
          ? Math.round(match.energy_kcal * multiplier * 10) / 10
          : item.calories;
      const protein =
        match.protein_g != null
          ? Math.round(match.protein_g * multiplier * 10) / 10
          : item.protein;
      const fat =
        match.fat_g != null
          ? Math.round(match.fat_g * multiplier * 10) / 10
          : item.fat;
      const carbs =
        match.carbs_g != null
          ? Math.round(match.carbs_g * multiplier * 10) / 10
          : item.carbs;

      return {
        ...item,
        calories,
        protein,
        fat,
        carbs,
        source: 'jfct' as const,
        foodCode: match.food_code,
        matchedName: match.name_ja,
        confidence: Math.max(item.confidence, 0.9),
      };
    })
  );

  const totals = enrichedItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
      confidence: acc.confidence + item.confidence,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, confidence: 0 }
  );

  const overallConfidence =
    enrichedItems.length > 0 ? totals.confidence / enrichedItems.length : 0.7;

  console.log('🥗 栄養突合: 完了', {
    itemsCount: enrichedItems.length,
    matchedCount: enrichedItems.filter((item) => item.source === 'jfct').length,
    totals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
    }
  });

  return {
    ...result,
    items: enrichedItems,
    totalCalories: Math.round(totals.calories),
    totalProtein: Math.round(totals.protein * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
    totalCarbs: Math.round(totals.carbs * 10) / 10,
    overallConfidence: Math.round(overallConfidence * 100) / 100,
  };
}

async function findBestMatch(name: string): Promise<JfctFoodRow | null> {
  if (!supabaseRestEndpoint) return null;

  const searchTerms = createSearchTerms(name);

  for (const term of searchTerms) {
    const match = await querySupabase(term);
    if (match) {
      return match;
    }
  }

  return null;
}

function createSearchTerms(name: string): string[] {
  const trimmed = name.trim();
  const withoutBrackets = trimmed.split(/[（(]/)[0].trim();
  const noSpaces = trimmed.replace(/\s+/g, '');

  const terms = new Set<string>();
  [trimmed, withoutBrackets, noSpaces].forEach((term) => {
    if (term && term.length > 0) {
      terms.add(term);
    }
  });

  return Array.from(terms);
}

async function querySupabase(term: string): Promise<JfctFoodRow | null> {
  if (!supabaseRestEndpoint) return null;

  const encodedTerm = encodeURIComponent(term);
  const url = `${supabaseRestEndpoint}?select=food_code,name_ja,energy_kcal,protein_g,fat_g,carbs_g,index_number&name_ja=ilike.*${encodedTerm}*&order=index_number.asc&limit=5`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
    });

    if (!response.ok) {
      console.error('🥗 栄養突合: Supabase呼び出し失敗', {
        term,
        status: response.status,
        body: await response.text()
      });
      return null;
    }

    const data = (await response.json()) as JfctFoodRow[];
    if (!Array.isArray(data) || data.length === 0) {
      console.log('🥗 栄養突合: Supabaseヒットなし', { term });
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('🥗 栄養突合: Supabase通信エラー', { term, error });
    return null;
  }
}
