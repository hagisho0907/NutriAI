// API services index
export { authService } from './auth'
export { nutritionService } from './nutrition'
export { mealsService } from './meals'
export { exercisesService } from './exercises'
export { bodyMetricsService } from './body-metrics'
export { chatService } from './chat'
export { foodsService } from './foods'

// Re-export API client and types for convenience
export { apiClient, APIError } from '../client'
export type { RequestOptions } from '../client'

// Re-export common request/response types
export type { LoginRequest, RegisterRequest } from './auth'
export type { MealLogParams, CreateMealRequest, CreateMealTemplateRequest, UseMealTemplateRequest } from './meals'
export type { ExerciseLogParams, CreateExerciseLogRequest, ExerciseSearchParams, ExerciseStatsParams, CalorieCalculationRequest } from './exercises'
export type { BodyMetricsParams, CreateBodyMetricsRequest, BodyMetricsStatsParams } from './body-metrics'
export type { ChatMessagesParams, SendMessageRequest, ChatFeedbackRequest, ChatExportParams } from './chat'
export type { FoodSearchParams, CustomFoodParams, CreateCustomFoodRequest } from './foods'