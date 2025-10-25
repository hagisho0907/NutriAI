import { ProcessedImage } from '../utils/imageProcessing';
import { VisionAnalysisError, APIError } from '../utils/errorHandling';
import { retryVisionAnalysis } from '../utils/retry';
import { enrichVisionResultWithDatabase } from './nutrition-database';

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: number;
  source?: 'gemini' | 'jfct' | 'usda' | 'mock';
  foodCode?: string;
  matchedName?: string;
}

export interface VisionAnalysisResult {
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  overallConfidence: number;
  analysisId: string;
  provider: string;
  fallback: boolean;
  rawResponse?: unknown;
  processedAt: Date;
}

export interface VisionService {
  analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult>;
}

// Mock implementation for development
export class MockVisionService implements VisionService {
  async analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock data based on description or random
    const mockFoods = [
      { name: 'ご飯', quantity: 150, unit: 'g', multiplier: 1.68 },
      { name: '鶏胸肉', quantity: 100, unit: 'g', multiplier: 1.65 },
      { name: 'サラダ', quantity: 80, unit: 'g', multiplier: 0.2 },
      { name: '味噌汁', quantity: 200, unit: 'ml', multiplier: 0.3 },
      { name: '卵焼き', quantity: 60, unit: 'g', multiplier: 1.5 }
    ];
    
    // Randomly select 1-3 items
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedItems = mockFoods
      .sort(() => Math.random() - 0.5)
      .slice(0, numItems);
    
    const items: FoodItem[] = selectedItems.map(food => {
      const baseCalories = food.quantity * food.multiplier;
      const protein = baseCalories * 0.15 / 4; // 15% from protein
      const fat = baseCalories * 0.25 / 9; // 25% from fat
      const carbs = baseCalories * 0.6 / 4; // 60% from carbs
      
      return {
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: Math.round(baseCalories),
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100,
        source: 'mock'
      };
    });
    
    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
    
    const overallConfidence = 
      items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
    
    return {
      items,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      overallConfidence: Math.round(overallConfidence * 100) / 100,
      analysisId: `mock-${Date.now()}`,
      provider: 'mock',
      fallback: true,
      processedAt: new Date()
    };
  }
}

interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

// Gemini service implementation
export class GeminiVisionService implements VisionService {
  constructor(
    private apiKey: string,
    private config: GeminiConfig = {}
  ) {}

  async analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult> {
    return retryVisionAnalysis(async () => {
      const payload = await this.buildRequestPayload(image, description);
      const controller = new AbortController();
      const timeoutMs =
        this.config.timeoutMs ??
        (process.env.GEMINI_TIMEOUT_MS ? parseInt(process.env.GEMINI_TIMEOUT_MS, 10) : 20000);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const rawModel =
          this.config.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite-preview-02-05';
        const normalizedModel = rawModel.startsWith('models/')
          ? rawModel.slice('models/'.length)
          : rawModel;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          normalizedModel
        )}:generateContent?key=${this.apiKey}`;

        console.log('🚀 GeminiVisionService: 分析開始');
        console.log('🧠 モデル:', normalizedModel);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Gemini APIエラー:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });

          const retryable = response.status >= 500 && response.status < 600;
          throw new APIError(
            `Gemini API error: ${response.status} - ${errorText}`,
            response.status,
            retryable
          );
        }

        const data = await response.json();
        console.log('📋 Geminiレスポンス受信', data);

        const parsedResult = this.parseResponse(data, description);
        this.logGeminiEstimation(parsedResult);
        return await enrichVisionResultWithDatabase(parsedResult);
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIError('Gemini request timed out', 504, true);
        }

        throw new VisionAnalysisError(`Failed to analyze image via Gemini: ${error}`);
      } finally {
        clearTimeout(timeoutId);
      }
    });
  }

  private async buildRequestPayload(image: ProcessedImage, description?: string): Promise<{
    contents: Array<{
      role: string;
      parts: Array<Record<string, unknown>>;
    }>;
    generationConfig: {
      temperature: number;
      maxOutputTokens: number;
      responseMimeType: string;
    };
  }> {
    const base64 = await this.ensureBase64(image);
    const mimeType = (image.file && image.file.type) || 'image/jpeg';
    const sanitizedDescription = (description || '').trim().substring(0, 500);

    const instruction = [
      'あなたは日本語で回答する栄養アシスタントです。写真に写っている食事を解析し、可能な限り実際の重量（g）を推定してください。',
      '必ず以下のJSONスキーマに沿って出力し、食品名・説明は日本語で記載してください。',
      '{',
      '  "items": [',
      '    {',
      '      "name": "string (食品名: 日本語)",',
      '      "quantity": number (推定量: g単位)',
      '      "unit": "string (単位。基本は\"g\")",',
      '      "calories": number (kcal),',
      '      "protein": number (g),',
      '      "fat": number (g),',
      '      "carbs": number (g),',
      '      "confidence": number (0-1)',
      '    }',
      '  ],',
      '  "notes": "optional short string"',
      '}',
      '食品の数に制限はありません。重量(g)が不明な場合でも最も可能性が高い値を推定して記入してください。',
      'JSONオブジェクト以外のテキストは出力しないでください。'
    ].join('\n');

    const userContext = sanitizedDescription
      ? `User provided description:\n${sanitizedDescription}`
      : 'No additional description provided by the user.';

    const temperature = this.config.temperature ?? (process.env.GEMINI_TEMPERATURE ? parseFloat(process.env.GEMINI_TEMPERATURE) : 0.2);
    const maxOutputTokens = this.config.maxOutputTokens ?? (process.env.GEMINI_MAX_OUTPUT_TOKENS ? parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 10) : 512);

    return {
      contents: [
        {
          role: 'user',
          parts: [
            { text: instruction },
            { text: userContext },
            {
              inlineData: {
                mimeType,
                data: base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: Number.isFinite(temperature) ? Number(temperature) : 0.2,
        maxOutputTokens: Number.isFinite(maxOutputTokens) ? Number(maxOutputTokens) : 512,
        responseMimeType: 'application/json'
      }
    };
  }

  private async ensureBase64(image: ProcessedImage): Promise<string> {
    if (image.dataUrl) {
      return this.extractBase64(image.dataUrl);
    }

    if (typeof window === 'undefined') {
      throw new Error('Processed image missing dataUrl');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(this.extractBase64(reader.result as string));
      reader.onerror = () => reject(new Error('Failed to convert image to base64'));
      reader.readAsDataURL(image.file);
    });
  }

  private extractBase64(dataUrl: string): string {
    if (!dataUrl) {
      throw new Error('Invalid data URL');
    }

    if (dataUrl.startsWith('data:')) {
      const commaIndex = dataUrl.indexOf(',');
      return commaIndex >= 0 ? dataUrl.substring(commaIndex + 1) : dataUrl;
    }

    return dataUrl;
  }

  private parseResponse(response: any, description?: string): VisionAnalysisResult {
    try {
      const payload = this.extractJsonPayload(response);
      const candidateItems = this.extractCandidateItems(payload);
      let items = candidateItems
        .map((candidate: any) => this.normalizeFoodItem(candidate))
        .filter(item => !Number.isNaN(item.calories));
      let fallback = false;

      if (items.length === 0 && description) {
        items = this.createEstimationFromDescription(description);
        fallback = true;
      }

      if (items.length === 0) {
        items = [this.createFallbackItem(description)];
        fallback = true;
      }

      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          fat: acc.fat + item.fat,
          carbs: acc.carbs + item.carbs
        }),
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
      );

      const overallConfidence = items.length > 0
        ? items.reduce((sum, item) => sum + (item.confidence || 0.6), 0) / items.length
        : 0.6;

      return {
        items,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein * 10) / 10,
        totalFat: Math.round(totals.fat * 10) / 10,
        totalCarbs: Math.round(totals.carbs * 10) / 10,
        overallConfidence: Math.round(overallConfidence * 100) / 100,
        analysisId: `gemini-${Date.now()}`,
        provider: 'gemini',
        fallback,
        rawResponse: response,
        processedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Geminiレスポンス解析エラー:', error);

      const fallbackItem = this.createFallbackItem(description);
      return {
        items: [fallbackItem],
        totalCalories: fallbackItem.calories,
        totalProtein: fallbackItem.protein,
        totalFat: fallbackItem.fat,
        totalCarbs: fallbackItem.carbs,
        overallConfidence: 0.5,
        analysisId: `gemini-fallback-${Date.now()}`,
        provider: 'gemini',
        fallback: true,
        rawResponse: response,
        processedAt: new Date()
      };
    }
  }

  private logGeminiEstimation(result: VisionAnalysisResult): void {
    const itemCount = result.items?.length ?? 0;

    console.log('🧪 Gemini推定: 解析結果サマリ', {
      itemCount,
      totalCalories: result.totalCalories,
      totalProtein: result.totalProtein,
      totalFat: result.totalFat,
      totalCarbs: result.totalCarbs,
      fallback: result.fallback
    });

    if (!itemCount) {
      console.warn('🧪 Gemini推定: アイテムが生成されませんでした');
      return;
    }

    const tableData = result.items.map((item) => ({
      name: item.name,
      quantity: `${item.quantity}${item.unit}`,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      confidence: item.confidence
    }));

    if (typeof console.table === 'function') {
      console.table(tableData);
    } else {
      console.log('🧪 Gemini推定: アイテム詳細', tableData);
    }
  }

  private extractJsonPayload(response: any): any | null {
    if (!response) {
      return null;
    }

    const candidates = Array.isArray(response.candidates) ? response.candidates : [];
    for (const candidate of candidates) {
      const parts = this.extractParts(candidate);
      for (const part of parts) {
        const text = this.extractText(part);
        if (text) {
          const parsed = this.parseJsonString(text);
          if (parsed) {
            return parsed;
          }
        }
      }
    }

    return null;
  }

  private extractParts(candidate: any): any[] {
    if (!candidate) return [];
    if (Array.isArray(candidate.content?.parts)) {
      return candidate.content.parts;
    }
    if (Array.isArray(candidate.content)) {
      return candidate.content;
    }
    return [];
  }

  private extractText(part: any): string | null {
    if (!part) return null;
    if (typeof part === 'string') {
      return part.trim();
    }
    if (typeof part.text === 'string') {
      return part.text.trim();
    }
    if (Array.isArray(part)) {
      for (const inner of part) {
        const text = this.extractText(inner);
        if (text) return text;
      }
    }
    return null;
  }

  private parseJsonString(text: string): any | null {
    if (!text) return null;
    const trimmed = text.trim();
    const attempts = [trimmed];

    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      attempts.push(match[0]);
    }

    for (const attempt of attempts) {
      try {
        return JSON.parse(attempt);
      } catch {
        continue;
      }
    }
    return null;
  }

  private extractCandidateItems(payload: any): any[] {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload.items)) {
      return payload.items;
    }

    if (Array.isArray(payload.foods)) {
      return payload.foods;
    }

    return [];
  }

  private normalizeFoodItem(item: any): FoodItem {
    const name =
      item.name ||
      item.food_name ||
      item.label ||
      item.title ||
      'Unknown food';

    const nutrition =
      item.nutrition ||
      item.nutrients ||
      {};

    const calories =
      this.parseNumber(item.calories) ||
      this.parseNumber(item.calories_kcal) ||
      this.parseNumber(nutrition.kcal) ||
      this.parseNumber(nutrition.calories) ||
      this.parseNumber(nutrition.calories_kcal) ||
      0;

    const protein =
      this.parseNumber(nutrition.protein) ||
      this.parseNumber(nutrition.protein_g) ||
      this.parseNumber(item.protein) ||
      this.parseNumber(item.protein_g) ||
      this.estimateMacroFromCalories(calories, 0.15);

    const fat =
      this.parseNumber(nutrition.fat) ||
      this.parseNumber(nutrition.fat_g) ||
      this.parseNumber(item.fat) ||
      this.parseNumber(item.fat_g) ||
      this.estimateMacroFromCalories(calories, 0.25, 9);

    const carbs =
      this.parseNumber(nutrition.carbs) ||
      this.parseNumber(nutrition.carb) ||
      this.parseNumber(nutrition.carbohydrates) ||
      this.parseNumber(item.carbs) ||
      this.parseNumber(item.carbs_g) ||
      this.estimateMacroFromCalories(calories, 0.6);

    const quantity =
      this.parseNumber(item.quantity) ||
      this.parseNumber(item.portion) ||
      this.parseNumber(item.amount) ||
      this.parseNumber(item.quantity_g) ||
      this.parseNumber(item.quantity_in_grams) ||
      this.parseNumber(item.mass_g) ||
      100;

    const unit =
      (item.unit ||
        item.unit_name ||
        item.serving_unit ||
        'g').toString();

    let confidence =
      this.parseNumber(item.confidence) ||
      this.parseNumber(item.confidence_score) ||
      this.parseNumber(item.confidence_pct) ||
      this.parseNumber(item.probability) ||
      0.75;

    if (confidence > 1) {
      confidence = confidence / 100;
    }
    if (!confidence || confidence < 0) {
      confidence = 0.6;
    }

   return {
      name: String(name),
      quantity,
      unit,
      calories: Math.max(0, Math.round(calories)),
      protein: Math.max(0, Math.round(protein * 10) / 10),
      fat: Math.max(0, Math.round(fat * 10) / 10),
      carbs: Math.max(0, Math.round(carbs * 10) / 10),
      confidence: Math.min(1, Math.max(0, Math.round(confidence * 100) / 100)),
      source: 'gemini'
    };
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (typeof value === 'object' && 'value' in value) {
      return this.parseNumber(value.value);
    }

    return null;
  }

  private estimateMacroFromCalories(calories: number, ratio: number, kcalPerGram: number = 4): number {
    if (!calories || calories <= 0) {
      return 0;
    }
    return (calories * ratio) / kcalPerGram;
  }

  private createFallbackItem(description?: string): FoodItem {
    const name = description?.split('\n').filter(Boolean)[0] || 'Unknown meal';
    const calories = 200;

    return {
      name,
      quantity: 100,
      unit: 'g',
      calories,
      protein: Math.round((calories * 0.2 / 4) * 10) / 10,
      fat: Math.round((calories * 0.3 / 9) * 10) / 10,
      carbs: Math.round((calories * 0.5 / 4) * 10) / 10,
      confidence: 0.5,
      source: 'gemini'
    };
  }

  private createEstimationFromDescription(description: string): FoodItem[] {
    return description
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const calories = 180;
        return {
          name: line,
          quantity: 100,
          unit: 'g',
          calories,
          protein: Math.round((calories * 0.2 / 4) * 10) / 10,
          fat: Math.round((calories * 0.3 / 9) * 10) / 10,
          carbs: Math.round((calories * 0.5 / 4) * 10) / 10,
          confidence: 0.55,
          source: 'gemini'
        };
      });
  }

}

// Factory function to get appropriate service
export function createVisionService(): VisionService {
  // Check if running on server-side
  const isServer = typeof window === 'undefined';
  
  // Only use real API on server-side with proper API key
  if (isServer) {
    const useGemini =
      process.env.NEXT_PUBLIC_ENABLE_GEMINI === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_REAL_AI_ANALYSIS === 'true';
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const config: GeminiConfig = {};

    if (process.env.GEMINI_MODEL) {
      config.model = process.env.GEMINI_MODEL;
    }
    if (process.env.GEMINI_TEMPERATURE) {
      const parsed = parseFloat(process.env.GEMINI_TEMPERATURE);
      if (Number.isFinite(parsed)) {
        config.temperature = parsed;
      }
    }
    if (process.env.GEMINI_MAX_OUTPUT_TOKENS) {
      const parsed = parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 10);
      if (Number.isFinite(parsed)) {
        config.maxOutputTokens = parsed;
      }
    }
    if (process.env.GEMINI_TIMEOUT_MS) {
      const parsed = parseInt(process.env.GEMINI_TIMEOUT_MS, 10);
      if (Number.isFinite(parsed)) {
        config.timeoutMs = parsed;
      }
    }
    
    console.log('🏭 VisionService作成 (サーバーサイド):', {
      useGemini,
      hasAPIKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      model: config.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite-preview-02-05',
      env: process.env.NODE_ENV
    });
    
    if (useGemini && apiKey) {
      console.log('✅ GeminiVisionService を使用');
      return new GeminiVisionService(apiKey, config);
    }
  }
  
  // Default to mock service for client-side or when API key not available
  console.log('🎭 MockVisionService を使用');
  return new MockVisionService();
}
