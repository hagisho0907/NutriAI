// Exercises hooks for React Query
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { 
  exercisesService, 
  type ExerciseLogParams, 
  type CreateExerciseLogRequest, 
  type ExerciseSearchParams,
  type ExerciseStatsParams,
  type CalorieCalculationRequest
} from '../../api/services/exercises'
import { queryKeys, getRelatedQueryKeys } from '../query-keys'
import { STALE_TIME, CACHE_TIME } from '../config'
import type { ExerciseLog, ExerciseTemplate } from '../../../types/exercise'
import type { PaginatedResponse } from '../../../types/api'

// Exercise query hooks

/**
 * Hook to get exercises for a specific date
 * Uses shorter cache time for more up-to-date data
 */
export function useDailyExercises(date: string) {
  return useQuery({
    queryKey: queryKeys.exercises.daily(date),
    queryFn: () => exercisesService.getDailyExercises(date),
    staleTime: STALE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
    enabled: !!date,
  })
}

/**
 * Hook to get exercise log with filters and pagination
 */
export function useExerciseLog(params: ExerciseLogParams = {}) {
  const filters = { ...params } as Record<string, unknown>
  return useQuery({
    queryKey: queryKeys.exercises.list(filters),
    queryFn: () => exercisesService.getExerciseLog(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Infinite query hook for exercise log with pagination
 * Useful for loading more exercises as user scrolls
 */
export function useInfiniteExerciseLog(params: Omit<ExerciseLogParams, 'offset'> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.exercises.list({ ...params, infinite: true }),
    queryFn: ({ pageParam = 0 }) =>
      exercisesService.getExerciseLog({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<ExerciseLog>) => {
      if (!lastPage.pagination.hasMore) return undefined
      return lastPage.pagination.offset + lastPage.pagination.limit
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get exercise history for a date range
 */
export function useExerciseHistory(startDate: string, endDate: string, limit = 100) {
  return useInfiniteQuery({
    queryKey: queryKeys.exercises.history(startDate, endDate, { limit }),
    queryFn: ({ pageParam = 0 }) =>
      exercisesService.getExerciseHistory(startDate, endDate, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<ExerciseLog>) => {
      if (!lastPage.pagination.hasMore) return undefined
      return lastPage.pagination.offset + lastPage.pagination.limit
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Hook to search exercise templates
 */
export function useSearchExercises(params: ExerciseSearchParams) {
  const filters = { ...params } as Record<string, unknown>
  return useQuery({
    queryKey: queryKeys.exercises.search(params.q, filters),
    queryFn: () => exercisesService.searchExercises(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: params.q.length >= 2, // Only search when query is at least 2 characters
  })
}

/**
 * Hook to get exercise templates
 */
export function useExerciseTemplates(params: { category?: string; limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.exercises.templates(),
    queryFn: () => exercisesService.getExerciseTemplates(params),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get exercise categories
 */
export function useExerciseCategories() {
  return useQuery({
    queryKey: queryKeys.exercises.categories(),
    queryFn: exercisesService.getExerciseCategories,
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get exercise statistics for a date range
 */
export function useExerciseStats(params: ExerciseStatsParams) {
  return useQuery({
    queryKey: [...queryKeys.exercises.all, 'stats', params],
    queryFn: () => exercisesService.getExerciseStats(params),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook to get popular exercises
 */
export function usePopularExercises(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.exercises.all, 'popular', { limit }],
    queryFn: () => exercisesService.getPopularExercises(limit),
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get exercise template by ID
 */
export function useExerciseTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(templateId),
    queryFn: () => exercisesService.getExerciseTemplate(templateId),
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!templateId,
  })
}

/**
 * Hook to get exercise recommendations
 */
export function useExerciseRecommendations(params?: { 
  category?: string
  intensityLevel?: string
  durationMin?: number
  limit?: number 
}) {
  return useQuery({
    queryKey: [...queryKeys.exercises.all, 'recommendations', params],
    queryFn: () => exercisesService.getExerciseRecommendations(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get weekly exercise summary
 */
export function useWeeklyExerciseSummary(startDate: string) {
  return useQuery({
    queryKey: [...queryKeys.exercises.all, 'weekly-summary', startDate],
    queryFn: () => exercisesService.getWeeklyExerciseSummary(startDate),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!startDate,
  })
}

// Exercise mutation hooks

/**
 * Hook to log a new exercise
 * Includes optimistic updates and cache invalidation
 */
export function useLogExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exerciseData: CreateExerciseLogRequest) => exercisesService.logExercise(exerciseData),
    onMutate: async (newExercise) => {
      const date = new Date(newExercise.performedAt || new Date()).toISOString().split('T')[0]
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.exercises.daily(date) })

      // Snapshot the previous value
      const previousExercises = queryClient.getQueryData<ExerciseLog[]>(queryKeys.exercises.daily(date))

      // Optimistically add the new exercise
      const optimisticExercise: ExerciseLog = {
        id: `temp_${Date.now()}`,
        userId: 'current-user',
        ...newExercise,
        performedAt:
          newExercise.performedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData(queryKeys.exercises.daily(date), (old: ExerciseLog[] = []) => {
        return [...old, optimisticExercise]
      })

      return { previousExercises, date }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousExercises && context?.date) {
        queryClient.setQueryData(queryKeys.exercises.daily(context.date), context.previousExercises)
      }
      console.error('Failed to log exercise:', error)
    },
    onSuccess: (data, variables) => {
      const date = new Date(data.performedAt).toISOString().split('T')[0]
      
      // Invalidate related queries
      getRelatedQueryKeys.onExercisesChange(date).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to update an existing exercise log
 */
export function useUpdateExerciseLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ exerciseId, exerciseData }: { exerciseId: string; exerciseData: Partial<ExerciseLog> }) =>
      exercisesService.updateExerciseLog(exerciseId, exerciseData),
    onMutate: async ({ exerciseId, exerciseData }) => {
      // Find the exercise in cache and get its date
      const allExerciseQueries = queryClient.getQueriesData({ queryKey: queryKeys.exercises.all })
      let targetDate: string | undefined

      for (const [queryKey, data] of allExerciseQueries) {
        if (Array.isArray(data)) {
          const exercise = data.find((ex: ExerciseLog) => ex.id === exerciseId)
          if (exercise) {
            targetDate = new Date(exercise.performedAt).toISOString().split('T')[0]
            break
          }
        }
      }

      if (!targetDate) return { previousExercises: undefined, date: undefined }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.exercises.daily(targetDate) })

      // Snapshot the previous value
      const previousExercises = queryClient.getQueryData<ExerciseLog[]>(queryKeys.exercises.daily(targetDate))

      // Optimistically update the exercise
      queryClient.setQueryData(queryKeys.exercises.daily(targetDate), (old: ExerciseLog[] = []) => {
        return old.map(exercise => 
          exercise.id === exerciseId 
            ? { ...exercise, ...exerciseData } 
            : exercise
        )
      })

      return { previousExercises, date: targetDate }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousExercises && context?.date) {
        queryClient.setQueryData(queryKeys.exercises.daily(context.date), context.previousExercises)
      }
      console.error('Failed to update exercise:', error)
    },
    onSuccess: (data, variables) => {
      const date = new Date(data.performedAt).toISOString().split('T')[0]
      
      // Invalidate related queries
      getRelatedQueryKeys.onExercisesChange(date).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to delete an exercise log
 */
export function useDeleteExerciseLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exerciseId: string) => exercisesService.deleteExerciseLog(exerciseId),
    onMutate: async (exerciseId) => {
      // Find the exercise in cache and remove it optimistically
      const allExerciseQueries = queryClient.getQueriesData({ queryKey: queryKeys.exercises.all })
      let targetDate: string | undefined
      let deletedExercise: ExerciseLog | undefined

      for (const [queryKey, data] of allExerciseQueries) {
        if (Array.isArray(data)) {
          const exercise = data.find((ex: ExerciseLog) => ex.id === exerciseId)
          if (exercise) {
            targetDate = new Date(exercise.performedAt).toISOString().split('T')[0]
            deletedExercise = exercise
            break
          }
        }
      }

      if (!targetDate || !deletedExercise) return { previousExercises: undefined, date: undefined }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.exercises.daily(targetDate) })

      // Snapshot the previous value
      const previousExercises = queryClient.getQueryData<ExerciseLog[]>(queryKeys.exercises.daily(targetDate))

      // Optimistically remove the exercise
      queryClient.setQueryData(queryKeys.exercises.daily(targetDate), (old: ExerciseLog[] = []) => {
        return old.filter(exercise => exercise.id !== exerciseId)
      })

      return { previousExercises, date: targetDate, deletedExercise }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousExercises && context?.date) {
        queryClient.setQueryData(queryKeys.exercises.daily(context.date), context.previousExercises)
      }
      console.error('Failed to delete exercise:', error)
    },
    onSuccess: (data, variables, context) => {
      if (context?.date) {
        // Invalidate related queries
        getRelatedQueryKeys.onExercisesChange(context.date).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
    },
  })
}

/**
 * Hook to calculate calories for an exercise
 * Useful for real-time calorie estimation
 */
export function useCalculateCalories() {
  return useMutation({
    mutationFn: (params: CalorieCalculationRequest) => exercisesService.calculateCalories(params),
    onError: (error) => {
      console.error('Failed to calculate calories:', error)
    },
  })
}

/**
 * Hook to copy an exercise to another date
 */
export function useCopyExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ exerciseId, targetDate }: { exerciseId: string; targetDate: string }) =>
      exercisesService.copyExercise(exerciseId, targetDate),
    onSuccess: (data, variables) => {
      // Invalidate related queries for the target date
      getRelatedQueryKeys.onExercisesChange(variables.targetDate).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (error) => {
      console.error('Failed to copy exercise:', error)
    },
  })
}

/**
 * Hook to bulk log multiple exercises
 */
export function useBulkLogExercises() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exercises: CreateExerciseLogRequest[]) => exercisesService.bulkLogExercises(exercises),
    onSuccess: (data) => {
      // Get all unique dates from the logged exercises
      const uniqueDates = [...new Set(data.map(exercise => 
        new Date(exercise.performedAt).toISOString().split('T')[0]
      ))]

      // Invalidate related queries for all affected dates
      uniqueDates.forEach(date => {
        getRelatedQueryKeys.onExercisesChange(date).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      })
    },
    onError: (error) => {
      console.error('Failed to bulk log exercises:', error)
    },
  })
}
