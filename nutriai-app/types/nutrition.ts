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

// Daily nutrition summary
export interface DailyNutrition extends NutritionData {
  date: string; // ISO date format (YYYY-MM-DD)
  calorieIntake: number;
  calorieBurned: number;
  waterMl?: number;
  // Targets
  targetCalories: number;
  targetProteinG: number;
  targetFatG: number;
  targetCarbG: number;
  // Calculated fields
  netCalories: number; // intake - burned
  pfcBalance: PFCBalance;
}

// Daily summary with additional fields from DB
export interface DailySummary {
  id: string;
  userId: string;
  summaryDate: string; // ISO date format
  calorieIntake: number;
  calorieBurned: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  waterMl?: number;
  sleepHours?: number;
  tdeeEstimated?: number; // Total Daily Energy Expenditure
  adherenceScore?: number; // 0-100
  createdAt: string;
}

// Nutrition goals/targets
export interface NutritionGoals {
  dailyCalories: number;
  dailyProteinG: number;
  dailyFatG: number;
  dailyCarbG: number;
  dailyWaterMl?: number;
  // Ranges for flexibility
  calorieRange?: {
    min: number;
    max: number;
  };
  macroRatios?: {
    proteinPercent: number;
    fatPercent: number;
    carbPercent: number;
  };
}