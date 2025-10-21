// React Query hooks index
// This file exports all the React Query hooks for easy importing

// Auth hooks
export {
  useCurrentUser,
  useLogin,
  useRegister,
  useGuestLogin,
  useRefreshToken,
  useLogout,
  useIsAuthenticated,
  useUpdateProfile,
} from './auth'

// Nutrition hooks
export {
  useNutritionGoals,
  useDailyNutrition,
  useNutritionSummary,
  useNutritionHistory,
  useWaterIntake,
  useUpdateNutritionGoals,
  useLogWater,
  useBulkUpdateNutrition,
  useNutritionProgress,
  useWeeklyNutritionAverage,
} from './nutrition'

// Meals hooks
export {
  useDailyMeals,
  useMealLog,
  useInfiniteMealLog,
  useMealTemplates,
  useMyMealTemplates,
  usePublicMealTemplates,
  useSearchMeals,
  useMealAnalysis,
  useMealStatistics,
  useLogMeal,
  useUpdateMeal,
  useDeleteMeal,
  useCreateMealTemplate,
  useUpdateMealTemplate,
  useDeleteMealTemplate,
  useUseMealTemplate,
  useCopyMeal,
  useBulkLogMeals,
} from './meals'

// Exercises hooks
export {
  useDailyExercises,
  useExerciseLog,
  useInfiniteExerciseLog,
  useExerciseHistory,
  useSearchExercises,
  useExerciseTemplates,
  useExerciseCategories,
  useExerciseStats,
  usePopularExercises,
  useExerciseTemplate,
  useExerciseRecommendations,
  useWeeklyExerciseSummary,
  useLogExercise,
  useUpdateExerciseLog,
  useDeleteExerciseLog,
  useCalculateCalories,
  useCopyExercise,
  useBulkLogExercises,
} from './exercises'

// Body Metrics hooks
export {
  useLatestBodyMetrics,
  useBodyMetrics,
  useBodyMetricsHistory,
  useBodyMetricsStats,
  useBodyMetricsProgress,
  useBodyCompositionAnalysis,
  useWeeklyBodyMetricsSummary,
  useBodyMetricsTrends,
  useIdealWeightRecommendations,
  useAddBodyMetrics,
  useUpdateBodyMetrics,
  useDeleteBodyMetrics,
  useCalculateBMI,
  useBulkImportBodyMetrics,
  useExportBodyMetrics,
  useWeightProgress,
  useRecentWeightTrend,
} from './body-metrics'

// Chat hooks
export {
  useChatMessages,
  useInfiniteChatMessages,
  useChatSuggestions,
  useConversationSummary,
  useAIInsights,
  useConversationStarters,
  useSearchMessages,
  useMessageTemplates,
  useConversationContext,
  useSendMessage,
  useDeleteMessage,
  useClearMessages,
  useSubmitFeedback,
  useExportChat,
  useMarkConversationImportant,
  useStreamMessage,
} from './chat'

// Foods hooks
export {
  useSearchFoods,
  useInfiniteSearchFoods,
  useSearchByBarcode,
  useFoodById,
  useFoodCategories,
  usePopularFoods,
  useRecentFoods,
  useCustomFoods,
  useInfiniteCustomFoods,
  useFavoriteFoods,
  useFoodRecommendations,
  useFoodAlternatives,
  useFoodUsageStats,
  useAdvancedFoodSearch,
  useCreateCustomFood,
  useUpdateCustomFood,
  useDeleteCustomFood,
  useAnalyzeFoodImage,
  useAddToFavorites,
  useRemoveFromFavorites,
  useCompareFoods,
  useBatchBarcodeSearch,
  useIsFavoriteFood,
  useFoodSuggestions,
} from './foods'

// Re-export configuration and query keys for advanced usage
export { queryKeys, getRelatedQueryKeys } from '../query-keys'
export { STALE_TIME, CACHE_TIME, RETRY_CONFIG, createQueryClient } from '../config'

// Re-export providers
export { ReactQueryProvider } from '../providers'

// Type exports for hook parameters and responses
export type {
  // Auth types
  LoginRequest,
  RegisterRequest,
} from '../../api/services/auth'

export type {
  // Nutrition types
  NutritionGoals,
  DailyNutrition,
} from '../../../types'

export type {
  // Meals types
  MealLogParams,
  CreateMealRequest,
  CreateMealTemplateRequest,
  UseMealTemplateRequest,
} from '../../api/services/meals'

export type {
  // Exercises types
  ExerciseLogParams,
  CreateExerciseLogRequest,
  ExerciseSearchParams,
  ExerciseStatsParams,
  CalorieCalculationRequest,
} from '../../api/services/exercises'

export type {
  // Body Metrics types
  BodyMetricsParams,
  CreateBodyMetricsRequest,
  BodyMetricsStatsParams,
} from '../../api/services/body-metrics'

export type {
  // Chat types
  ChatMessagesParams,
  SendMessageRequest,
  ChatFeedbackRequest,
  ChatExportParams,
} from '../../api/services/chat'

export type {
  // Foods types
  FoodSearchParams,
  CustomFoodParams,
  CreateCustomFoodRequest,
} from '../../api/services/foods'