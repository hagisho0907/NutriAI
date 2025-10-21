// Nutrition hooks for React Query
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { nutritionService } from '../../api/services/nutrition'
import { queryKeys, getRelatedQueryKeys } from '../query-keys'
import { STALE_TIME, CACHE_TIME } from '../config'
import type { NutritionGoals, DailyNutrition, NutrientBalance } from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

// Nutrition query hooks

/**
 * Hook to get nutrition goals
 * Uses longer cache time since goals don't change frequently
 */
export function useNutritionGoals() {
  return useQuery({
    queryKey: queryKeys.nutrition.goals(),
    queryFn: nutritionService.getGoals,
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get daily nutrition for a specific date
 * Uses shorter cache time for more up-to-date data
 */
export function useDailyNutrition(date: string) {
  return useQuery({
    queryKey: queryKeys.nutrition.daily(date),
    queryFn: () => nutritionService.getDailyNutrition(date),
    staleTime: STALE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
    enabled: !!date,
  })
}

/**
 * Hook to get nutrition summary for a specific date
 * Includes nutrition data, goals, balance, and AI insights
 */
export function useNutritionSummary(date: string) {
  return useQuery({
    queryKey: queryKeys.nutrition.summary(date),
    queryFn: () => nutritionService.getNutritionSummary(date),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!date,
  })
}

/**
 * Infinite query hook for nutrition history
 * Supports pagination for large datasets
 */
export function useNutritionHistory(startDate: string, endDate: string, limit = 30) {
  return useInfiniteQuery({
    queryKey: queryKeys.nutrition.history(startDate, endDate, { limit }),
    queryFn: ({ pageParam = 0 }) =>
      nutritionService.getNutritionHistory(startDate, endDate, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<DailyNutrition>) => {
      if (!lastPage.pagination.hasMore) return undefined
      return lastPage.pagination.offset + lastPage.pagination.limit
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Hook to get water intake for a specific date
 */
export function useWaterIntake(date: string) {
  return useQuery({
    queryKey: queryKeys.nutrition.water(date),
    queryFn: async () => {
      // Get daily nutrition and extract water intake
      const dailyNutrition = await nutritionService.getDailyNutrition(date)
      return {
        date,
        waterMl: dailyNutrition.waterIntake || 0,
        target: 2500, // Default target - this could come from goals
      }
    },
    staleTime: STALE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
    enabled: !!date,
  })
}

// Nutrition mutation hooks

/**
 * Hook to update nutrition goals
 * Includes optimistic updates and cache invalidation
 */
export function useUpdateNutritionGoals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (goals: Partial<NutritionGoals>) => nutritionService.updateGoals(goals),
    onMutate: async (newGoals) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.nutrition.goals() })

      // Snapshot the previous value
      const previousGoals = queryClient.getQueryData<NutritionGoals>(queryKeys.nutrition.goals())

      // Optimistically update to the new value
      if (previousGoals) {
        queryClient.setQueryData(queryKeys.nutrition.goals(), {
          ...previousGoals,
          ...newGoals,
        })
      }

      return { previousGoals }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.nutrition.goals(), context.previousGoals)
      }
      console.error('Failed to update nutrition goals:', error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.goals() })
      // Also invalidate dashboard since it depends on goals
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    },
  })
}

/**
 * Hook to log water intake
 * Updates water tracking with optimistic updates
 */
export function useLogWater() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ amount, date }: { amount: number; date?: string }) =>
      nutritionService.logWater(amount, date),
    onMutate: async ({ amount, date }) => {
      const targetDate = date || new Date().toISOString().split('T')[0]
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.nutrition.water(targetDate) })

      // Snapshot the previous value
      const previousWater = queryClient.getQueryData(queryKeys.nutrition.water(targetDate))

      // Optimistically update water intake
      queryClient.setQueryData(queryKeys.nutrition.water(targetDate), (old: any) => {
        if (!old) return { date: targetDate, waterMl: amount, target: 2500 }
        return {
          ...old,
          waterMl: old.waterMl + amount,
        }
      })

      return { previousWater, targetDate }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousWater && context?.targetDate) {
        queryClient.setQueryData(queryKeys.nutrition.water(context.targetDate), context.previousWater)
      }
      console.error('Failed to log water:', error)
    },
    onSuccess: (data, variables) => {
      const targetDate = variables.date || new Date().toISOString().split('T')[0]
      
      // Invalidate related queries
      getRelatedQueryKeys.onNutritionChange(targetDate).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to bulk update daily nutrition
 * Useful when multiple nutrition entries are updated at once
 */
export function useBulkUpdateNutrition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ date, nutrition }: { date: string; nutrition: Partial<DailyNutrition> }) => {
      // This would be a real API call to bulk update nutrition
      // For now, we'll simulate it
      const currentNutrition = queryClient.getQueryData<DailyNutrition>(queryKeys.nutrition.daily(date))
      
      return {
        ...currentNutrition,
        ...nutrition,
        date,
      } as DailyNutrition
    },
    onMutate: async ({ date, nutrition }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.nutrition.daily(date) })

      // Snapshot the previous value
      const previousNutrition = queryClient.getQueryData<DailyNutrition>(queryKeys.nutrition.daily(date))

      // Optimistically update
      if (previousNutrition) {
        queryClient.setQueryData(queryKeys.nutrition.daily(date), {
          ...previousNutrition,
          ...nutrition,
        })
      }

      return { previousNutrition, date }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousNutrition && context?.date) {
        queryClient.setQueryData(queryKeys.nutrition.daily(context.date), context.previousNutrition)
      }
      console.error('Failed to update nutrition:', error)
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      getRelatedQueryKeys.onNutritionChange(variables.date).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Utility hook to get nutrition progress for a date
 * Combines daily nutrition with goals to calculate progress
 */
export function useNutritionProgress(date: string) {
  const { data: dailyNutrition, ...dailyQuery } = useDailyNutrition(date)
  const { data: goals, ...goalsQuery } = useNutritionGoals()

  return {
    ...dailyQuery,
    isLoading: dailyQuery.isLoading || goalsQuery.isLoading,
    error: dailyQuery.error || goalsQuery.error,
    data: dailyNutrition && goals ? {
      date,
      nutrition: dailyNutrition,
      goals,
      progress: {
        caloriesPercent: goals.dailyTargets.calories ? (dailyNutrition.totalNutrients.calories / goals.dailyTargets.calories) * 100 : 0,
        proteinPercent: goals.dailyTargets.protein ? (dailyNutrition.totalNutrients.protein / goals.dailyTargets.protein) * 100 : 0,
        fatPercent: goals.dailyTargets.fat ? (dailyNutrition.totalNutrients.fat / goals.dailyTargets.fat) * 100 : 0,
        carbPercent: goals.dailyTargets.carbs ? (dailyNutrition.totalNutrients.carbs / goals.dailyTargets.carbs) * 100 : 0,
        waterPercent: goals.dailyTargets.waterMl ? ((dailyNutrition.waterIntake || 0) / goals.dailyTargets.waterMl) * 100 : 0,
      },
    } : undefined,
  }
}

/**
 * Hook to track weekly nutrition averages
 * Useful for analytics and progress tracking
 */
export function useWeeklyNutritionAverage(startDate: string) {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  const endDateStr = endDate.toISOString().split('T')[0]

  return useQuery({
    queryKey: queryKeys.nutrition.history(startDate, endDateStr, { type: 'weekly-average' }),
    queryFn: async () => {
      const history = await nutritionService.getNutritionHistory(startDate, endDateStr, 7, 0)
      
      if (history.items.length === 0) {
        return null
      }

      // Calculate averages
      const total = history.items.reduce(
        (acc, day) => ({
          calories: acc.calories + (day.totalNutrients.calories || 0),
          protein: acc.protein + (day.totalNutrients.protein || 0),
          fat: acc.fat + (day.totalNutrients.fat || 0),
          carbs: acc.carbs + (day.totalNutrients.carbs || 0),
          water: acc.water + (day.waterIntake || 0),
        }),
        { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0 }
      )

      const count = history.items.length

      return {
        startDate,
        endDate: endDateStr,
        daysCount: count,
        averages: {
          caloriesKcal: Math.round(total.calories / count),
          proteinG: Math.round((total.protein / count) * 10) / 10,
          fatG: Math.round((total.fat / count) * 10) / 10,
          carbG: Math.round((total.carbs / count) * 10) / 10,
          waterMl: Math.round(total.water / count),
        },
      }
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!startDate,
  })
}
