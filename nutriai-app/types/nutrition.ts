// Nutrition-related type definitions for NutriAI

// Basic nutrition data
export interface NutritionData {
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  sugarG?: number;
  fiberG?: number;
  saltEqG?: number; // Salt equivalent in grams
}

// Extended nutrition data with additional fields
export interface ExtendedNutritionData extends NutritionData {
  waterMl?: number;
  saturatedFatG?: number;
  cholesterolMg?: number;
  sodiumMg?: number;
  potassiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  vitaminAUg?: number;
  vitaminCMg?: number;
}

// PFC (Protein, Fat, Carbohydrate) balance percentages
export interface PFCBalance {
  protein: number; // Percentage
  fat: number; // Percentage
  carb: number; // Percentage
}

export type NutrientKey =
  | 'calories'
  | 'protein'
  | 'fat'
  | 'carbs'
  | 'fiber'
  | 'sugar'
  | 'sodium'
  | 'saturatedFat'
  | 'cholesterol'

export interface DailyNutrition {
  id: string;
  userId: string;
  date: string | Date;
  totalNutrients: Record<NutrientKey | string, number>;
  meals: string[];
  waterIntake: number;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Legacy fields kept for backward compatibility
  calorieIntake?: number;
  calorieBurned?: number;
  targetCalories?: number;
  targetProteinG?: number;
  targetFatG?: number;
  targetCarbG?: number;
  netCalories?: number;
  pfcBalance?: PFCBalance;
}

export interface DailySummary {
  id: string;
  userId: string;
  summaryDate: string;
  calorieIntake: number;
  calorieBurned: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  waterMl?: number;
  sleepHours?: number;
  tdeeEstimated?: number;
  adherenceScore?: number;
  createdAt: string;
}

export interface NutrientProgress {
  consumed: number;
  target: number;
  remaining: number;
  percentage: number;
}

export type NutrientBalance = Record<NutrientKey | string, NutrientProgress>;

export interface NutritionGoals {
  id: string;
  userId: string;
  dailyTargets: Record<NutrientKey | string, number>;
  macroRatios: {
    protein: number;
    fat: number;
    carbs: number;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  // Legacy fields for compatibility with older code paths
  dailyCalories?: number;
  dailyProteinG?: number;
  dailyFatG?: number;
  dailyCarbG?: number;
  dailyWaterMl?: number;
  calorieRange?: {
    min: number;
    max: number;
  };
  macroRatiosLegacy?: {
    proteinPercent: number;
    fatPercent: number;
    carbPercent: number;
  };
}

export interface NutritionSummary {
  date: string;
  nutrition: DailyNutrition;
  goals: NutritionGoals;
  balance: NutrientBalance;
  insights: {
    topNutrients: string[];
    recommendations: string[];
  };
}
