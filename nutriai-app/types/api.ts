// API-related type definitions for NutriAI

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    version: string;
  };
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Error response
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      issue: string;
      min?: number;
      max?: number;
    }>;
    traceId?: string;
  };
}

// Common query parameters
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface GuestLoginResponse {
  user: {
    id: string;
    email: string;
  };
  tokens: AuthTokens;
}

// Dashboard API
export interface DashboardTodayResponse {
  date: string;
  summary: {
    calorieIntake: number;
    calorieBurned: number;
    proteinG: number;
    fatG: number;
    carbG: number;
    waterMl?: number;
  };
  targets: {
    calories: number;
    proteinG: number;
    fatG: number;
    carbG: number;
    waterMl?: number;
  };
  tasks: Array<{
    type: string;
    status: 'pending' | 'completed';
    title: string;
  }>;
  streak?: {
    currentDays: number;
    bestDays: number;
  };
  aiAdvice?: string;
}

// Analytics API
export interface AnalyticsProgressResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  weightProgress: {
    startWeight: number;
    currentWeight: number;
    targetWeight?: number;
    changeKg: number;
    changePercent: number;
  };
  nutritionAverage: {
    calories: number;
    proteinG: number;
    fatG: number;
    carbG: number;
  };
  exerciseStats: {
    totalDurationMin: number;
    totalCaloriesBurned: number;
    sessionCount: number;
    avgDurationPerSession: number;
  };
  adherence: {
    calorieAdherencePercent: number;
    exerciseDaysPercent: number;
    loggingConsistencyPercent: number;
  };
}

// File upload response
export interface FileUploadResponse {
  url: string;
  key: string;
  expiresAt?: string;
}

// Health check
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  services?: {
    [key: string]: {
      status: 'ok' | 'down';
      latencyMs?: number;
    };
  };
}