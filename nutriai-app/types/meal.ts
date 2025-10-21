// Meal-related type definitions for NutriAI

import { MealItem, CreateMealItemRequest } from './food';
import { NutritionData } from './nutrition';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealSource = 'photo' | 'barcode' | 'manual' | 'template';

// Base meal interface
export interface Meal {
  id: string;
  userId: string;
  loggedAt: string; // ISO 8601 timestamp
  mealType: MealType;
  source: MealSource;
  photoUrl?: string;
  notes?: string;
  aiEstimated: boolean;
  items: MealItem[];
  // Computed totals
  totalCalories: number;
  totalProteinG: number;
  totalFatG: number;
  totalCarbG: number;
  createdAt: string;
}

// Meal without items (for list views)
export interface MealSummary extends Omit<Meal, 'items'> {
  itemCount: number;
}

// Create meal request
export interface CreateMealRequest {
  loggedAt: string;
  mealType: MealType;
  source: MealSource;
  photoUrl?: string;
  notes?: string;
  items?: CreateMealItemRequest[];
}

// Meal log entry (simplified for calendar view)
export interface MealLogEntry {
  id: string;
  date: string; // ISO date format
  mealType: MealType;
  calories: number;
  hasPhoto: boolean;
}

// Custom meal template
export interface MealTemplate {
  id: string;
  userId: string;
  name: string;
  photoUrl?: string;
  foods: MealTemplateFood[];
  totalNutrition: NutritionData;
  instructions?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Food item in meal template
export interface MealTemplateFood {
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  nutrition: NutritionData;
}

// Create meal template request
export interface CreateMealTemplateRequest {
  name: string;
  photoUrl?: string;
  foods: Array<{
    foodId: string;
    quantity: number;
    unit: string;
  }>;
  instructions?: string;
  isPublic?: boolean;
}

export interface MealAnalysis {
  meal: Meal;
  nutritionBreakdown: {
    caloriesPerItem: { itemName: string; calories: number }[];
    macroDistribution: { protein: number; fat: number; carbs: number };
    micronutrients?: Record<string, number>;
  };
  aiInsights: {
    healthScore: number;
    recommendations: string[];
    improvements: string[];
  };
}

export interface MealStatistics {
  totalMeals: number;
  averageCaloriesPerMeal: number;
  mostCommonMealType: string;
  nutritionTrends: Array<{
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
  }>;
}

// AI meal estimation
export interface MealEstimationRequest {
  photoUrl: string;
  notes?: string;
  mealType?: MealType;
}

export interface MealEstimationResponse {
  estimatedItems: Array<{
    foodName: string;
    foodId?: string; // If matched to existing food
    quantity: number;
    unit: string;
    nutrition: NutritionData;
    confidence: number;
  }>;
  totalNutrition: NutritionData;
  overallConfidence: number;
  suggestions?: string[];
}
