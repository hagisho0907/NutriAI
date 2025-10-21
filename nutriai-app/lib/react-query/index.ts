// React Query library index
// Main entry point for all React Query functionality

// Export all hooks
export * from './hooks'

// Export configuration and utilities
export {
  createQueryClient,
  queryErrorHandler,
  shouldRetry,
  STALE_TIME,
  CACHE_TIME,
  RETRY_CONFIG,
} from './config'

// Export query keys
export { queryKeys, getRelatedQueryKeys } from './query-keys'
export type {
  QueryKey,
  AuthQueryKey,
  NutritionQueryKey,
  MealsQueryKey,
  FoodsQueryKey,
  ExercisesQueryKey,
  BodyMetricsQueryKey,
  ChatQueryKey,
  DashboardQueryKey,
  AnalyticsQueryKey,
  UtilityQueryKey,
} from './query-keys'

// Export providers
export { ReactQueryProvider } from './providers'

// Re-export commonly used React Query types and utilities
export type {
  UseQueryResult,
  UseMutationResult,
  UseInfiniteQueryResult,
  QueryClient,
  MutationOptions,
  QueryOptions,
  InfiniteQueryOptions,
} from '@tanstack/react-query'

export {
  useQueryClient,
  useIsFetching,
  useIsMutating,
} from '@tanstack/react-query'