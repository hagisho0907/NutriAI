// Body Metrics hooks for React Query
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { 
  bodyMetricsService, 
  type BodyMetricsParams, 
  type CreateBodyMetricsRequest, 
  type BodyMetricsStatsParams 
} from '../../api/services/body-metrics'
import { queryKeys, getRelatedQueryKeys } from '../query-keys'
import { STALE_TIME, CACHE_TIME } from '../config'
import type { BodyMetrics } from '../../../types/body-metrics'
import type { PaginatedResponse } from '../../../types/api'

// Body Metrics query hooks

/**
 * Hook to get the latest body metrics
 * Uses longer cache time since this is frequently accessed
 */
export function useLatestBodyMetrics() {
  return useQuery({
    queryKey: queryKeys.bodyMetrics.latest(),
    queryFn: bodyMetricsService.getLatestBodyMetrics,
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get body metrics with filtering and pagination
 */
export function useBodyMetrics(params: BodyMetricsParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.bodyMetrics.all, 'list', params],
    queryFn: () => bodyMetricsService.getBodyMetrics(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get body metrics history for a date range
 */
export function useBodyMetricsHistory(startDate: string, endDate: string, limit = 100) {
  return useInfiniteQuery({
    queryKey: queryKeys.bodyMetrics.history(startDate, endDate),
    queryFn: ({ pageParam = 0 }) =>
      bodyMetricsService.getBodyMetricsHistory(startDate, endDate, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<BodyMetrics>) => {
      if (!lastPage.pagination.hasMore) return undefined
      return lastPage.pagination.offset + lastPage.pagination.limit
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Hook to get body metrics statistics for a date range
 */
export function useBodyMetricsStats(params: BodyMetricsStatsParams) {
  return useQuery({
    queryKey: queryKeys.bodyMetrics.statistics('custom', JSON.stringify(params)),
    queryFn: () => bodyMetricsService.getBodyMetricsStats(params),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!params.startDate && !!params.endDate,
  })
}

/**
 * Hook to get body metrics progress over time
 */
export function useBodyMetricsProgress(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  return useQuery({
    queryKey: [...queryKeys.bodyMetrics.all, 'progress', period],
    queryFn: () => bodyMetricsService.getBodyMetricsProgress(period),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get body composition analysis for a specific measurement
 */
export function useBodyCompositionAnalysis(metricsId: string) {
  return useQuery({
    queryKey: [...queryKeys.bodyMetrics.all, 'analysis', metricsId],
    queryFn: () => bodyMetricsService.getBodyCompositionAnalysis(metricsId),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!metricsId,
  })
}

/**
 * Hook to get weekly body metrics summary
 */
export function useWeeklyBodyMetricsSummary(startDate: string) {
  return useQuery({
    queryKey: [...queryKeys.bodyMetrics.all, 'weekly-summary', startDate],
    queryFn: () => bodyMetricsService.getWeeklyBodyMetricsSummary(startDate),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!startDate,
  })
}

/**
 * Hook to get body metrics trends analysis
 */
export function useBodyMetricsTrends(metric: 'weight' | 'bodyFat' | 'muscleMass' | 'visceralFat', period: '30d' | '90d' | '1y' = '30d') {
  return useQuery({
    queryKey: queryKeys.bodyMetrics.trends(metric, period),
    queryFn: () => bodyMetricsService.getBodyMetricsTrends(metric, period),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get ideal weight recommendations
 */
export function useIdealWeightRecommendations(
  heightCm: number, 
  age: number, 
  gender: 'male' | 'female' | 'other', 
  activityLevel: string
) {
  return useQuery({
    queryKey: [...queryKeys.bodyMetrics.all, 'ideal-weight', { heightCm, age, gender, activityLevel }],
    queryFn: () => bodyMetricsService.getIdealWeightRecommendations(heightCm, age, gender, activityLevel),
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!heightCm && !!age && !!gender && !!activityLevel,
  })
}

// Body Metrics mutation hooks

/**
 * Hook to add new body metrics
 * Includes optimistic updates and cache invalidation
 */
export function useAddBodyMetrics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (metricsData: CreateBodyMetricsRequest) => bodyMetricsService.addBodyMetrics(metricsData),
    onMutate: async (newMetrics) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bodyMetrics.latest() })

      // Snapshot the previous value
      const previousLatest = queryClient.getQueryData<BodyMetrics | null>(queryKeys.bodyMetrics.latest())

      // Optimistically update to the new value if it's more recent
      const optimisticMetrics: BodyMetrics = {
        id: `temp_${Date.now()}`,
        userId: 'current-user',
        ...newMetrics,
        recordedOn: newMetrics.recordedOn ?? new Date().toISOString().split('T')[0],
        measurementDate: new Date(newMetrics.measurementDate ?? newMetrics.recordedOn ?? new Date().toISOString()).toISOString(),
        createdAt: new Date().toISOString(),
      }

      // Only update if this is more recent than the current latest
      if (
        !previousLatest ||
        new Date(optimisticMetrics.measurementDate ?? optimisticMetrics.recordedOn).getTime() >
          new Date(previousLatest.measurementDate ?? previousLatest.recordedOn).getTime()
      ) {
        queryClient.setQueryData(queryKeys.bodyMetrics.latest(), optimisticMetrics)
      }

      return { previousLatest }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousLatest !== undefined) {
        queryClient.setQueryData(queryKeys.bodyMetrics.latest(), context.previousLatest)
      }
      console.error('Failed to add body metrics:', error)
    },
    onSuccess: (data) => {
      // Invalidate related queries
      getRelatedQueryKeys.onBodyMetricsChange().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Invalidate body metrics lists and history
      queryClient.invalidateQueries({ queryKey: queryKeys.bodyMetrics.all })
    },
  })
}

/**
 * Hook to update existing body metrics
 */
export function useUpdateBodyMetrics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ metricsId, metricsData }: { metricsId: string; metricsData: Partial<BodyMetrics> }) =>
      bodyMetricsService.updateBodyMetrics(metricsId, metricsData),
    onMutate: async ({ metricsId, metricsData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bodyMetrics.all })

      // Snapshot the previous values
      const previousLatest = queryClient.getQueryData<BodyMetrics | null>(queryKeys.bodyMetrics.latest())
      
      // Optimistically update if this is the latest measurement
      if (previousLatest && previousLatest.id === metricsId) {
        queryClient.setQueryData(queryKeys.bodyMetrics.latest(), {
          ...previousLatest,
          ...metricsData,
        })
      }

      return { previousLatest, metricsId }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousLatest && context?.metricsId === variables.metricsId) {
        queryClient.setQueryData(queryKeys.bodyMetrics.latest(), context.previousLatest)
      }
      console.error('Failed to update body metrics:', error)
    },
    onSuccess: (data) => {
      // Invalidate related queries
      getRelatedQueryKeys.onBodyMetricsChange().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Invalidate body metrics lists and history
      queryClient.invalidateQueries({ queryKey: queryKeys.bodyMetrics.all })
    },
  })
}

/**
 * Hook to delete body metrics
 */
export function useDeleteBodyMetrics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (metricsId: string) => bodyMetricsService.deleteBodyMetrics(metricsId),
    onMutate: async (metricsId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bodyMetrics.all })

      // Snapshot the previous values
      const previousLatest = queryClient.getQueryData<BodyMetrics | null>(queryKeys.bodyMetrics.latest())
      
      // If we're deleting the latest measurement, we need to handle this carefully
      // For now, we'll just invalidate and refetch
      return { previousLatest, metricsId }
    },
    onError: (error, variables, context) => {
      console.error('Failed to delete body metrics:', error)
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      getRelatedQueryKeys.onBodyMetricsChange().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Invalidate body metrics lists and history
      queryClient.invalidateQueries({ queryKey: queryKeys.bodyMetrics.all })
    },
  })
}

/**
 * Hook to calculate BMI
 */
export function useCalculateBMI() {
  return useMutation({
    mutationFn: ({ weightKg, heightCm }: { weightKg: number; heightCm: number }) =>
      bodyMetricsService.calculateBMI(weightKg, heightCm),
    onError: (error) => {
      console.error('Failed to calculate BMI:', error)
    },
  })
}

/**
 * Hook to bulk import body metrics
 */
export function useBulkImportBodyMetrics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (metrics: CreateBodyMetricsRequest[]) => bodyMetricsService.bulkImportBodyMetrics(metrics),
    onSuccess: (data) => {
      // Invalidate related queries
      getRelatedQueryKeys.onBodyMetricsChange().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Invalidate body metrics lists and history
      queryClient.invalidateQueries({ queryKey: queryKeys.bodyMetrics.all })
    },
    onError: (error) => {
      console.error('Failed to bulk import body metrics:', error)
    },
  })
}

/**
 * Hook to export body metrics data
 */
export function useExportBodyMetrics() {
  return useMutation({
    mutationFn: ({ startDate, endDate, format }: { 
      startDate: string
      endDate: string
      format?: 'csv' | 'json' 
    }) => bodyMetricsService.exportBodyMetrics(startDate, endDate, format),
    onError: (error) => {
      console.error('Failed to export body metrics:', error)
    },
  })
}

/**
 * Utility hook to get current weight progress
 * Combines latest metrics with goals for easy progress tracking
 */
export function useWeightProgress() {
  const { data: latestMetrics } = useLatestBodyMetrics()
  const { data: goals } = useQuery({
    queryKey: queryKeys.bodyMetrics.goals(),
    queryFn: async () => {
      // This would fetch user's weight goals
      // For now, return mock data
      return {
        targetWeightKg: 60,
        targetBodyFatPct: 20,
        deadline: '2024-12-31',
      }
    },
    staleTime: STALE_TIME.LONG,
  })

  return {
    currentWeight: latestMetrics?.weightKg,
    targetWeight: goals?.targetWeightKg,
    currentBodyFat: latestMetrics?.bodyFatPct,
    targetBodyFat: goals?.targetBodyFatPct,
    progress: latestMetrics && goals ? {
      weightDifference: latestMetrics.weightKg - goals.targetWeightKg,
      bodyFatDifference: latestMetrics.bodyFatPct ? latestMetrics.bodyFatPct - goals.targetBodyFatPct : undefined,
      progressPercent: goals.targetWeightKg ? Math.abs((latestMetrics.weightKg - goals.targetWeightKg) / goals.targetWeightKg) * 100 : 0,
    } : undefined,
    isLoading: !latestMetrics || !goals,
  }
}

/**
 * Hook to get recent weight trend (last 7 days)
 */
export function useRecentWeightTrend() {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  return useBodyMetricsStats({ startDate, endDate })
}
