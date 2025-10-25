import type { FoodItem, VisionAnalysisResult } from './vision';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

const canUseSupabase = Boolean(supabaseUrl && supabaseKey);
const supabaseRestEndpoint = canUseSupabase
  ? `${supabaseUrl.replace(/\/$/, '')}/rest/v1/jfct_foods`
  : null;

let cachedFoods: JfctFoodRow[] | null = null;
let cacheLoaded = false;

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

  const cachedMatch = await searchCache(searchTerms);
  if (cachedMatch) {
    return cachedMatch;
  }

  return null;
}

function createSearchTerms(name: string): string[] {
  const trimmed = name.trim();
  const withoutBrackets = trimmed.split(/[（(]/)[0].trim();
  const noSpaces = trimmed.replace(/\s+/g, '');

  const baseTerms = [trimmed, withoutBrackets, noSpaces];

  const normalizedForJa = withoutBrackets
    .replace(/[・,、()（）【】\[\]]/g, ' ')
    .replace(/の|と|＆|&|又は|または|と/gi, ' ')
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

  const synonymTerms = normalizedForJa.flatMap((term) => expandSynonyms(term));

  const terms = new Set<string>();
  [...baseTerms, ...normalizedForJa, ...synonymTerms].forEach((term) => {
    if (term && term.length > 0) {
      terms.add(term);
    }
  });

  return Array.from(terms);
}

function expandSynonyms(term: string): string[] {
  const dictionary: Record<string, string[]> = {
    'マグロ': ['まぐろ', '鮪'],
    '刺身': ['さしみ'],
    'ラーメン': ['らーめん', 'ramen'],
    '豚肉': ['ぶたにく', 'ポーク', 'pork'],
    '牛肉': ['ぎゅうにく', 'ビーフ', 'beef'],
    '鶏肉': ['とりにく', 'チキン', 'chicken'],
    'とうもろこし': ['コーン', 'corn'],
    '白米': ['ご飯', 'ごはん', 'ライス', 'rice'],
    'バター': ['butter']
  };

  const normalized = term
    .replace(/[A-Z]/g, (s) => s.toLowerCase())
    .replace(/[Ａ-Ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
    .replace(/[ａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248));

  const keys = Object.keys(dictionary);
  const matches = keys.filter((key) => key === term || key === normalized);

  const expansions = matches.flatMap((key) => dictionary[key]);
  return [term, normalized, ...expansions];
}

async function querySupabase(term: string): Promise<JfctFoodRow | null> {
  if (!supabaseRestEndpoint) return null;

  const encodedTerm = encodeURIComponent(term);
  const columnCandidates = ['name_ja', '食品名', '名称'];

  for (const column of columnCandidates) {
    const filterParam = `${encodeURIComponent(column)}=ilike.*${encodedTerm}*`;
    const url = `${supabaseRestEndpoint}?select=*&${filterParam}&limit=5`;

    try {
      const response = await fetch(url, {
        headers: {
          apikey: supabaseServiceRoleKey,
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('🥗 栄養突合: Supabase呼び出し失敗', {
          term,
          column,
          status: response.status,
          body: errorText
        });
        continue;
      }

      const rawData = await response.json();
      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.log('🥗 栄養突合: Supabaseヒットなし', { term, column });
        continue;
      }

      const mapped = mapRowToNutrition(rawData[0]);
      if (mapped) {
        return mapped;
      }
    } catch (error) {
      console.error('🥗 栄養突合: Supabase通信エラー', { term, column, error });
    }
  }

  return null;
}

async function ensureCacheLoaded(): Promise<JfctFoodRow[] | null> {
  if (!supabaseRestEndpoint) return null;
  if (cacheLoaded && cachedFoods) {
    return cachedFoods;
  }

  const url = `${supabaseRestEndpoint}?select=*&limit=5000`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
    });

    if (!response.ok) {
      console.error('🥗 栄養突合: Supabase全件取得失敗', {
        status: response.status,
        body: await response.text()
      });
      cacheLoaded = true;
      return null;
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.warn('🥗 栄養突合: Supabase全件取得レスポンスが配列ではありません');
      cacheLoaded = true;
      return null;
    }

    cachedFoods = rawData
      .map((row: Record<string, any>) => mapRowToNutrition(row))
      .filter((row): row is JfctFoodRow => row !== null);
    cacheLoaded = true;

    console.log('🥗 栄養突合: Supabase全件キャッシュ取得', {
      count: cachedFoods.length
    });

    return cachedFoods;
  } catch (error) {
    console.error('🥗 栄養突合: Supabase全件取得エラー', { error });
    cacheLoaded = true;
    return null;
  }
}

async function searchCache(terms: string[]): Promise<JfctFoodRow | null> {
  const cache = await ensureCacheLoaded();
  if (!cache || cache.length === 0) {
    return null;
  }

  const scored = cache
    .map((row) => ({ row, score: scoreRow(row, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return null;
  }

  const best = scored[0];
  console.log('🥗 栄養突合: キャッシュからマッチ', {
    terms,
    matchedName: best.row.name_ja,
    score: best.score
  });

  return best.row;
}

function scoreRow(row: JfctFoodRow, terms: string[]): number {
  const name = row.name_ja || '';
  if (!name) return 0;

  let score = 0;
  const normalizedName = normalizeString(name);

  for (const term of terms) {
    const normalizedTerm = normalizeString(term);
    if (!normalizedTerm) continue;

    if (normalizedName.includes(normalizedTerm)) {
      score += normalizedTerm.length;
    }
  }

  return score;
}

function normalizeString(input: string): string {
  return input
    .toLowerCase()
    .replace(/[（）()\[\]【】]/g, ' ')
    .replace(/の|と|＆|&|又は|または|と/g, ' ')
    .replace(/[・,、]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapRowToNutrition(row: Record<string, any>): JfctFoodRow | null {
  const getByKeys = (keys: string[]): any => {
    for (const key of keys) {
      if (key in row) {
        return row[key];
      }
      const lowerKey = key.toLowerCase();
      const found = Object.keys(row).find(
        (k) => k.toLowerCase() === lowerKey
      );
      if (found) {
        return row[found];
      }
    }
    return null;
  };

  const foodCode = getByKeys(['food_code', '食品番号', '食品コード']);
  const nameJa = getByKeys(['name_ja', '食品名', '名称']);
  const energy = getByKeys(['energy_kcal', 'エネルギー（kcal）', 'エネルギー(kcal)', 'エネルギー']);
  const protein = getByKeys(['protein_g', 'タンパク質', 'たんぱく質', 'たん白質']);
  const fat = getByKeys(['fat_g', '脂質']);
  const carbs = getByKeys(['carbs_g', '炭水化物']);

  if (!foodCode || !nameJa) {
    console.warn('🥗 栄養突合: 取得データをマッピングできませんでした', {
      availableKeys: Object.keys(row)
    });
    return null;
  }

  return {
    food_code: String(foodCode),
    name_ja: String(nameJa),
    energy_kcal: energy != null ? Number(energy) : null,
    protein_g: protein != null ? Number(protein) : null,
    fat_g: fat != null ? Number(fat) : null,
    carbs_g: carbs != null ? Number(carbs) : null,
  };
}
