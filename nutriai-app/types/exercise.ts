// Exercise-related type definitions for NutriAI

export type ExerciseCategory = 'cardio' | 'strength' | 'mobility' | 'other';
export type IntensityLevel = 'low' | 'medium' | 'high';

// Exercise template (predefined exercises)
export interface ExerciseTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  metValue: number; // Metabolic Equivalent of Task
  defaultDurationMin: number;
  defaultCalories: number; // For average person
  createdBy?: string; // If user-created
  createdAt: string;
}

// Exercise log entry
export interface ExerciseLog {
  id: string;
  userId: string;
  templateId: string;
  templateName: string; // Denormalized for performance
  performedAt: string; // ISO 8601 timestamp
  durationMin: number;
  caloriesBurned: number;
  intensityLevel: IntensityLevel;
  notes?: string;
  // Optional tracking fields
  distanceKm?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  createdAt: string;
}

// Create exercise log request
export interface CreateExerciseLogRequest {
  templateId: string;
  performedAt: string;
  durationMin: number;
  intensityLevel: IntensityLevel;
  caloriesBurned?: number; // If not provided, calculate from MET
  notes?: string;
  distanceKm?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
}

// Exercise summary for analytics
export interface ExerciseSummary {
  date: string; // ISO date format
  totalDurationMin: number;
  totalCaloriesBurned: number;
  exerciseCount: number;
  categories: {
    [key in ExerciseCategory]?: {
      durationMin: number;
      caloriesBurned: number;
      count: number;
    };
  };
}

// Weekly exercise stats
export interface WeeklyExerciseStats {
  weekStartDate: string;
  weekEndDate: string;
  totalDurationMin: number;
  totalCaloriesBurned: number;
  exerciseDays: number;
  avgDurationPerDay: number;
  avgCaloriesPerDay: number;
  mostFrequentCategory: ExerciseCategory | null;
}

// Create custom exercise template
export interface CreateExerciseTemplateRequest {
  name: string;
  category: ExerciseCategory;
  metValue?: number;
  defaultDurationMin?: number;
  defaultCalories?: number;
}