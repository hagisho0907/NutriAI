// User-related type definitions for NutriAI

export type Gender = 'male' | 'female' | 'other' | 'unset';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type LoginProvider = 'email' | 'google' | 'apple';

// Base user interface
export interface User {
  id: string; // UUID
  email: string;
  loginProvider: LoginProvider;
  status: UserStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// User profile information
export interface UserProfile {
  userId: string; // FK to User.id
  displayName?: string;
  gender?: Gender;
  birthDate?: string; // ISO date format (YYYY-MM-DD)
  heightCm?: number;
  activityLevel?: ActivityLevel;
  bodyFatPct?: number; // Percentage (0-100)
  lifestyleNotes?: string;
}

// Complete user with profile
export interface UserWithProfile extends User {
  profile: UserProfile;
}

// User goal types
export type GoalType = 'loss' | 'gain' | 'maintain';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface UserGoal {
  id: string; // UUID
  userId: string; // FK to User.id
  goalType: GoalType;
  targetWeightKg?: number;
  targetBodyFatPct?: number;
  targetCalorieIntake?: number; // Daily target
  targetDurationWeeks?: number;
  startDate: string; // ISO date format
  endDate?: string; // ISO date format
  status: GoalStatus;
  createdAt: string; // ISO 8601
}

// For goal creation/update requests
export interface CreateUserGoalRequest {
  goalType: GoalType;
  targetWeightKg?: number;
  targetBodyFatPct?: number;
  targetCalorieIntake?: number;
  targetDurationWeeks?: number;
  startDate: string;
  endDate?: string;
}

// User update request
export interface UpdateUserProfileRequest {
  displayName?: string;
  gender?: Gender;
  birthDate?: string;
  heightCm?: number;
  activityLevel?: ActivityLevel;
  bodyFatPct?: number;
  lifestyleNotes?: string;
}

// AI goal proposal request/response
export interface GoalProposalRequest {
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goalPreference: GoalType;
  desiredChangeKg?: number;
  deadlineWeeks?: number;
}

export interface GoalProposalResponse {
  suggestedGoal: {
    targetWeightKg: number;
    targetBodyFatPct?: number;
    targetCalorieIntake: number;
    targetCalorieBurn?: number;
    durationWeeks: number;
    weeklyCheckpoints?: Array<{
      week: number;
      weightKg: number;
    }>;
  };
  rationale: string;
  confidence: number; // 0-1
}