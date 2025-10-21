// Common/utility type definitions for NutriAI

// Date/time utilities
export type ISODateString = string; // YYYY-MM-DD
export type ISOTimestamp = string; // ISO 8601 full timestamp

// Common status types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// Task types for daily tracking
export interface DailyTask {
  id: string;
  type: 'log_meal' | 'log_exercise' | 'log_weight' | 'log_water' | 'custom';
  status: 'pending' | 'completed' | 'skipped';
  title: string;
  description?: string;
  targetTime?: string; // e.g., "08:00" for morning tasks
  completedAt?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'advice' | 'alert';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Achievement/badge types
export interface Achievement {
  id: string;
  type: 'streak' | 'goal' | 'milestone' | 'challenge';
  name: string;
  description: string;
  iconUrl?: string;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
}

// Settings/preferences
export interface UserSettings {
  notifications: {
    mealReminders: boolean;
    exerciseReminders: boolean;
    weightReminders: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
  };
  privacy: {
    shareProgress: boolean;
    publicProfile: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    language: 'ja' | 'en';
    units: {
      weight: 'kg' | 'lb';
      height: 'cm' | 'ft';
      distance: 'km' | 'mi';
      energy: 'kcal' | 'kJ';
    };
  };
  mealDefaults: {
    breakfastTime: string; // HH:MM
    lunchTime: string;
    dinnerTime: string;
    defaultPortion: 'small' | 'medium' | 'large';
  };
}

// Chart/visualization data types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  metadata?: any;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FieldError {
  field: string;
  message: string;
}

// Sorting and filtering
export type SortDirection = 'asc' | 'desc';

export interface SortOption<T> {
  field: keyof T;
  direction: SortDirection;
}

export interface FilterOption<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: any;
}

// Image types
export interface ImageAsset {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  size?: number; // bytes
  mimeType?: string;
}

// Geolocation (for future features)
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type ValueOf<T> = T[keyof T];