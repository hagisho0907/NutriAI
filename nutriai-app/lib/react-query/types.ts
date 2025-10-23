// React Query hook types
// Comprehensive type definitions for all React Query hooks

import type { UseQueryResult, UseMutationResult, UseInfiniteQueryResult } from '@tanstack/react-query'
import type { UserWithProfile } from '../../types/user'
import type { NutritionGoals, DailyNutrition } from '../../types/nutrition'
import type { Meal, MealTemplate } from '../../types/meal'
import type { ExerciseLog, ExerciseTemplate } from '../../types/exercise'
import type { BodyMetrics } from '../../types/body-metrics'
import type { ChatMessage, ChatSuggestion } from '../../types/chat'
import type { Food, CustomFood } from '../../types/food'
import type {
  PaginatedResponse,
  GuestLoginResponse,
  AuthTokens,
} from '../../types/api'

// Auth hook types
export type UseCurrentUserResult = UseQueryResult<UserWithProfile, Error>
export type UseLoginResult = UseMutationResult<GuestLoginResponse, Error, { email: string; password: string }>
export type UseRegisterResult = UseMutationResult<GuestLoginResponse, Error, { email: string; password: string; displayName?: string }>
export type UseGuestLoginResult = UseMutationResult<GuestLoginResponse, Error, void>
export type UseRefreshTokenResult = UseMutationResult<AuthTokens, Error, string>
export type UseLogoutResult = UseMutationResult<{ success: boolean }, Error, void>

// Nutrition hook types
export type UseNutritionGoalsResult = UseQueryResult<NutritionGoals, Error>
export type UseDailyNutritionResult = UseQueryResult<DailyNutrition, Error>
export type UseNutritionSummaryResult = UseQueryResult<{
  date: string
  nutrition: DailyNutrition
  goals: NutritionGoals
  balance: any
  insights: {
    topNutrients: string[]
    recommendations: string[]
  }
}, Error>
export type UseNutritionHistoryResult = UseInfiniteQueryResult<PaginatedResponse<DailyNutrition>, Error>
export type UseUpdateNutritionGoalsResult = UseMutationResult<NutritionGoals, Error, Partial<NutritionGoals>>
export type UseLogWaterResult = UseMutationResult<{ waterIntake: number; date: Date }, Error, { amount: number; date?: string }>

// Meals hook types
export type UseDailyMealsResult = UseQueryResult<Meal[], Error>
export type UseMealLogResult = UseQueryResult<PaginatedResponse<Meal>, Error>
export type UseInfiniteMealLogResult = UseInfiniteQueryResult<PaginatedResponse<Meal>, Error>
export type UseMealTemplatesResult = UseQueryResult<PaginatedResponse<MealTemplate>, Error>
export type UseMyMealTemplatesResult = UseQueryResult<MealTemplate[], Error>
export type UseLogMealResult = UseMutationResult<Meal, Error, any>
export type UseUpdateMealResult = UseMutationResult<Meal, Error, { mealId: string; mealData: Partial<Meal> }>
export type UseDeleteMealResult = UseMutationResult<{ success: boolean }, Error, string>

// Exercises hook types
export type UseDailyExercisesResult = UseQueryResult<ExerciseLog[], Error>
export type UseExerciseLogResult = UseQueryResult<PaginatedResponse<ExerciseLog>, Error>
export type UseInfiniteExerciseLogResult = UseInfiniteQueryResult<PaginatedResponse<ExerciseLog>, Error>
export type UseExerciseTemplatesResult = UseQueryResult<PaginatedResponse<ExerciseTemplate>, Error>
export type UseExerciseCategoriesResult = UseQueryResult<string[], Error>
export type UseLogExerciseResult = UseMutationResult<ExerciseLog, Error, any>
export type UseUpdateExerciseLogResult = UseMutationResult<ExerciseLog, Error, { exerciseId: string; exerciseData: Partial<ExerciseLog> }>
export type UseDeleteExerciseLogResult = UseMutationResult<{ success: boolean }, Error, string>

// Body Metrics hook types
export type UseLatestBodyMetricsResult = UseQueryResult<BodyMetrics | null, Error>
export type UseBodyMetricsResult = UseQueryResult<PaginatedResponse<BodyMetrics>, Error>
export type UseBodyMetricsHistoryResult = UseInfiniteQueryResult<PaginatedResponse<BodyMetrics>, Error>
export type UseAddBodyMetricsResult = UseMutationResult<BodyMetrics, Error, any>
export type UseUpdateBodyMetricsResult = UseMutationResult<BodyMetrics, Error, { metricsId: string; metricsData: Partial<BodyMetrics> }>
export type UseDeleteBodyMetricsResult = UseMutationResult<{ success: boolean }, Error, string>

// Chat hook types
export type UseChatMessagesResult = UseQueryResult<PaginatedResponse<ChatMessage>, Error>
export type UseInfiniteChatMessagesResult = UseInfiniteQueryResult<PaginatedResponse<ChatMessage>, Error>
export type UseChatSuggestionsResult = UseQueryResult<ChatSuggestion[], Error>
export type UseSendMessageResult = UseMutationResult<{
  userMessage: ChatMessage
  aiResponse: ChatMessage
}, Error, { content: string; context?: any }>
export type UseDeleteMessageResult = UseMutationResult<{ success: boolean }, Error, string>
export type UseClearMessagesResult = UseMutationResult<{ success: boolean }, Error, void>

// Foods hook types
export type UseSearchFoodsResult = UseQueryResult<PaginatedResponse<Food>, Error>
export type UseInfiniteSearchFoodsResult = UseInfiniteQueryResult<PaginatedResponse<Food>, Error>
export type UseSearchByBarcodeResult = UseQueryResult<Food, Error>
export type UseFoodByIdResult = UseQueryResult<Food, Error>
export type UseFoodCategoriesResult = UseQueryResult<string[], Error>
export type UsePopularFoodsResult = UseQueryResult<Food[], Error>
export type UseCustomFoodsResult = UseQueryResult<PaginatedResponse<CustomFood>, Error>
export type UseFavoriteFoodsResult = UseQueryResult<Food[], Error>
export type UseCreateCustomFoodResult = UseMutationResult<CustomFood, Error, any>
export type UseUpdateCustomFoodResult = UseMutationResult<CustomFood, Error, { foodId: string; foodData: Partial<CustomFood> }>
export type UseDeleteCustomFoodResult = UseMutationResult<{ success: boolean }, Error, string>

// Common mutation parameters
export interface MutationParams<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void
  onError?: (error: Error, variables: TVariables, context: unknown) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: unknown) => void
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown
}

// Common query parameters
export interface QueryParams {
  enabled?: boolean
  staleTime?: number
  gcTime?: number
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  retry?: boolean | number
  retryDelay?: number | ((attemptIndex: number) => number)
}

// Infinite query parameters
export interface InfiniteQueryParams extends QueryParams {
  getNextPageParam?: (lastPage: any, pages: any[]) => any
  getPreviousPageParam?: (firstPage: any, pages: any[]) => any
}

// Hook configuration types
export interface UseAuthHooksConfig {
  redirectOnLogin?: string
  redirectOnLogout?: string
  persistSession?: boolean
}

export interface UseDataHooksConfig {
  enableRealTimeUpdates?: boolean
  optimisticUpdates?: boolean
  backgroundRefetch?: boolean
  cacheTime?: number
  staleTime?: number
}

// Hook factory types for advanced usage
export type HookFactory<TParams, TResult> = (params: TParams) => TResult

// Error types for hooks
export interface HookError extends Error {
  code?: string
  status?: number
  details?: any
}

// Loading state types
export interface LoadingState {
  isLoading: boolean
  isFetching: boolean
  isRefetching: boolean
  isLoadingError: boolean
  isFetchingError: boolean
}

// Data state types
export interface DataState<T> {
  data?: T
  error?: HookError
  isSuccess: boolean
  isError: boolean
  status: 'idle' | 'loading' | 'error' | 'success'
}

// Combined hook result type
export interface HookResult<T> extends LoadingState, DataState<T> {
  refetch: () => void
  remove: () => void
}

// Mutation state types
export interface MutationState<TData, TVariables> {
  data?: TData
  error?: HookError
  isIdle: boolean
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  status: 'idle' | 'loading' | 'error' | 'success'
  variables?: TVariables
  context?: unknown
  mutate: (variables: TVariables) => void
  mutateAsync: (variables: TVariables) => Promise<TData>
  reset: () => void
}

// Cache management types
export interface CacheManagement {
  invalidate: (queryKey?: any[]) => void
  remove: (queryKey?: any[]) => void
  setData: <T>(queryKey: any[], data: T) => void
  getData: <T>(queryKey: any[]) => T | undefined
}

// Advanced hook configuration
export interface AdvancedHookConfig {
  enabled?: boolean
  retry?: boolean | number | ((failureCount: number, error: Error) => boolean)
  retryDelay?: number | ((attemptIndex: number) => number)
  staleTime?: number
  gcTime?: number
  refetchInterval?: number | false | ((data: any) => number | false)
  refetchIntervalInBackground?: boolean
  refetchOnMount?: boolean | 'always'
  refetchOnWindowFocus?: boolean | 'always'
  refetchOnReconnect?: boolean | 'always'
  notifyOnChangeProps?: 'all' | Array<keyof UseQueryResult>
  select?: <T>(data: any) => T
  suspense?: boolean
  useErrorBoundary?: boolean | ((error: Error) => boolean)
  meta?: Record<string, unknown>
}
