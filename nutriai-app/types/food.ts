// Food-related type definitions for NutriAI

import { NutritionData } from './nutrition';

// Food categories
export type FoodCategory = 
  | '穀物'
  | '野菜'
  | '果物'
  | '肉類'
  | '魚類'
  | '卵類'
  | '乳製品'
  | '大豆製品'
  | 'ナッツ類'
  | 'プロテイン製品'
  | 'その他';

// Base food interface
export interface Food extends NutritionData {
  id: string;
  name: string;
  janCode?: string; // Japanese Article Number (barcode)
  brand?: string;
  servingSize?: number;
  servingUnit?: string; // 'g', 'ml', '個', etc.
  category?: FoodCategory;
  externalSource?: string; // API source
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Custom food created by user
export interface CustomFood extends Omit<Food, 'janCode' | 'externalSource' | 'isVerified' | 'updatedAt'> {
  createdBy: string; // User ID
}

// Food search parameters
export interface FoodSearchParams {
  query?: string;
  category?: FoodCategory;
  brand?: string;
  limit?: number;
  offset?: number;
}

// Barcode search result
export interface BarcodeSearchResult {
  found: boolean;
  food?: Food;
  source?: string;
}

// Food item in a meal
export interface MealItem {
  id: string;
  mealId: string;
  foodId: string;
  foodName: string; // Denormalized for performance
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  fiberG?: number;
  confidence?: number; // AI estimation confidence (0-1)
  createdAt: string;
}

// Simplified meal item for requests
export interface CreateMealItemRequest {
  foodId: string;
  quantity: number;
  unit: string;
  // Optional overrides for custom portions
  calories?: number;
  proteinG?: number;
  fatG?: number;
  carbG?: number;
}

export interface FoodRecommendation {
  recommended: Food[];
  reasoning: string[];
  nutritionFocus: string[];
}

export interface FoodAlternatives {
  alternatives: Food[];
  comparisons: Array<{
    food: Food;
    nutritionDifference: {
      calories: number;
      proteinG: number;
      fatG: number;
      carbG: number;
      fiberG?: number;
    };
    improvementScore: number;
  }>;
}

export interface FoodComparison {
  foods: Food[];
  comparison: {
    perServing: Record<string, {
      calories: number;
      proteinG: number;
      fatG: number;
      carbG: number;
      fiberG?: number;
    }>;
    per100g: Record<string, {
      calories: number;
      proteinG: number;
      fatG: number;
      carbG: number;
      fiberG?: number;
    }>;
  };
  recommendations: string[];
}

export interface FoodUsageStats {
  food: Food;
  usageCount: number;
  lastUsed: string;
  averageQuantity: number;
  nutritionContribution: {
    dailyCaloriesPercent: number;
    dailyProteinPercent: number;
    dailyFatPercent: number;
    dailyCarbPercent: number;
  };
  trends: {
    usageFrequency: 'increasing' | 'decreasing' | 'stable';
    quantityTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface BatchBarcodeSearchResult {
  found: Array<{ barcode: string; food: Food }>;
  notFound: string[];
}
