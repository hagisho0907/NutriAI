// Core user and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  age: number;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryPreferences: string[];
  allergies: string[];
  healthConditions: string[];
  fitnessGoals: string[];
}

export interface UserPreferences {
  notifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  language: string;
  units: 'metric' | 'imperial';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Nutrition types
export type NutrientType = 
  | 'calories' 
  | 'protein' 
  | 'carbs' 
  | 'fat' 
  | 'fiber' 
  | 'sugar' 
  | 'sodium' 
  | 'saturatedFat' 
  | 'cholesterol';

export interface NutritionGoals {
  id: string;
  userId: string;
  dailyTargets: Record<NutrientType, number>;
  weeklyTargets?: Record<NutrientType, number>;
  macroRatios: {
    protein: number; // percentage
    carbs: number;   // percentage
    fat: number;     // percentage
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyNutrition {
  id: string;
  userId: string;
  date: Date;
  totalNutrients: Record<NutrientType, number>;
  meals: string[]; // meal IDs
  waterIntake: number; // in ml
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Food and meal types
export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize: number;
  servingUnit: string;
  quantity: number;
  nutrients: Record<NutrientType, number>;
  category: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  userId: string;
  name: string;
  type: MealType;
  foods: Food[];
  totalNutrients: Record<string, number>;
  date: Date;
  time: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  foods: Food[];
  totalNutrients: Record<string, number>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Exercise types
export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroups: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  caloriesPerMinute: number;
  description: string;
  instructions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseSession {
  id: string;
  userId: string;
  name: string;
  exercises: Array<{
    exercise: Exercise;
    sets?: number;
    reps?: number;
    duration?: number; // in minutes
    distance?: number; // in km
    weight?: number; // in kg
    notes?: string;
  }>;
  duration: number; // total duration in minutes
  totalCaloriesBurned: number;
  date: Date;
  startTime?: string;
  endTime?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseGoal {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: {
    sessions?: number;
    duration?: number; // in minutes
    caloriesBurned?: number;
  };
  current: {
    sessions: number;
    duration: number;
    caloriesBurned: number;
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Body metrics types
export type MetricType = 'weight' | 'bodyFat' | 'muscleMass' | 'waist';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface BodyMetrics {
  id: string;
  userId: string;
  date: Date;
  weight: number; // in kg
  height: number; // in cm
  bodyFatPercentage?: number;
  muscleMass?: number; // in kg
  waterPercentage?: number;
  boneMass?: number; // in kg
  visceralFat?: number;
  measurements?: {
    chest?: number; // in cm
    waist?: number;
    hips?: number;
    neck?: number;
    arms?: {
      left: number;
      right: number;
    };
    thighs?: {
      left: number;
      right: number;
    };
    calves?: {
      left: number;
      right: number;
    };
  };
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BodyMetricsGoal {
  id: string;
  userId: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'fat_loss' | 'maintenance';
  targetMetrics: {
    weight?: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
  };
  targetDate: Date;
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Chat and AI types
export type MessageType = 
  | 'text' 
  | 'nutrition_question' 
  | 'meal_analysis' 
  | 'exercise_recommendation' 
  | 'motivation'
  | 'meal_plan';

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'assistant';
  type: MessageType;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    responseTime?: number;
    mealPlan?: any;
    exerciseRecommendation?: any;
    regenerated?: boolean;
  };
  edited?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Notification types
export interface NotificationSettings {
  mealReminders: boolean;
  exerciseReminders: boolean;
  goalUpdates: boolean;
  weeklyReports: boolean;
  emailDigests: boolean;
}

// Progress tracking types
export interface ProgressData {
  date: Date;
  value: number;
  target?: number;
  notes?: string;
}

export interface GoalProgress {
  goalId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  trend: TrendDirection;
  lastUpdated: Date;
}

// Dashboard types
export interface DashboardStats {
  todaysCalories: number;
  calorieGoal: number;
  todaysExercise: number;
  exerciseGoal: number;
  currentWeight: number;
  weightGoal: number;
  weeklyProgress: {
    nutrition: number;
    exercise: number;
    weight: number;
  };
}