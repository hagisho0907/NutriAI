// Body metrics type definitions for NutriAI

export type MetricsSource = 'manual' | 'wearable' | 'import';

// Single body metrics record
export interface BodyMetrics {
  id: string;
  userId: string;
  recordedOn: string; // ISO date format (YYYY-MM-DD)
  measurementDate?: string | Date;
  weightKg: number;
  bodyFatPct?: number;
  skeletalMuscleKg?: number;
  muscleMassKg?: number;
  bmi?: number; // Calculated: weight / (height/100)^2
  visceralFatLevel?: number;
  basalMetabolicRate?: number; // kcal/day
  bmr?: number;
  bodyAge?: number;
  notes?: string;
  source: MetricsSource;
  createdAt: string;
}

// Create/update body metrics request
export interface CreateBodyMetricsRequest {
  recordedOn: string;
  weightKg: number;
  bodyFatPct?: number;
  skeletalMuscleKg?: number;
  visceralFatLevel?: number;
  basalMetabolicRate?: number;
  bodyAge?: number;
  notes?: string;
  source?: MetricsSource;
}

// Body metrics history for charts
export interface BodyMetricsHistory {
  userId: string;
  startDate: string;
  endDate: string;
  metrics: BodyMetrics[];
  // Statistical summaries
  weightTrend: 'increasing' | 'decreasing' | 'stable';
  avgWeightKg: number;
  weightChangeKg: number;
  bodyFatChangePercent?: number;
  muscleMassChangeKg?: number;
}

// Progress tracking
export interface ProgressMetrics {
  currentWeight: number;
  startWeight: number;
  targetWeight: number;
  weightChangeKg: number;
  weightChangePercent: number;
  remainingKg: number;
  progressPercent: number; // 0-100
  estimatedCompletionDate?: string;
  currentBodyFatPct?: number;
  startBodyFatPct?: number;
  targetBodyFatPct?: number;
}

// Monthly progress summary
export interface MonthlyProgress {
  month: string; // YYYY-MM
  avgWeightKg: number;
  avgBodyFatPct?: number;
  avgMuscleMassKg?: number;
  weightChangeFromPreviousMonth: number;
  measurementCount: number;
  goalAchievementRate: number; // 0-100
}

// Body composition analysis
export interface BodyComposition {
  date: string;
  weightKg: number;
  fatMassKg: number;
  muscleMassKg: number;
  boneMassKg?: number;
  waterMassKg?: number;
  otherMassKg?: number;
  // Percentages
  fatPercent: number;
  musclePercent: number;
  waterPercent?: number;
}
