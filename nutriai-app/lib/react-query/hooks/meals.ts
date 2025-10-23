// Meals hooks for React Query
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { mealsService, type MealLogParams, type CreateMealRequest, type CreateMealTemplateRequest, type UseMealTemplateRequest } from '../../api/services/meals'
import { queryKeys, getRelatedQueryKeys } from '../query-keys'
import { STALE_TIME, CACHE_TIME } from '../config'
import type { Meal, MealTemplate } from '../../../types/meal'
import type { PaginatedResponse } from '../../../types/api'

// Meal query hooks

/**
 * Hook to get meals for a specific date
 * Uses shorter cache time for more up-to-date data
 */
export function useDailyMeals(date: string) {
  return useQuery({
    queryKey: queryKeys.meals.daily(date),
    queryFn: () => mealsService.getDailyMeals(date),
    staleTime: STALE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
    enabled: !!date,
  })
}

/**
 * Hook to get meal log with filters and pagination
 */
export function useMealLog(params: MealLogParams = {}) {
  const filters = { ...params } as Record<string, unknown>
  return useQuery({
    queryKey: queryKeys.meals.list(filters),
    queryFn: () => mealsService.getMealLog(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Infinite query hook for meal log with pagination
 * Useful for loading more meals as user scrolls
 */
export function useInfiniteMealLog(params: Omit<MealLogParams, 'offset'> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.meals.list({ ...params, infinite: true }),
    queryFn: ({ pageParam = 0 }) =>
      mealsService.getMealLog({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Meal>) => {
      if (!lastPage.pagination.hasMore) return undefined
      return lastPage.pagination.offset + lastPage.pagination.limit
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get meal templates
 */
export function useMealTemplates(params: { public?: boolean; limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.meals.templates(),
    queryFn: () => mealsService.getMealTemplates(params),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get user's custom meal templates
 */
export function useMyMealTemplates() {
  return useQuery({
    queryKey: queryKeys.meals.templates(),
    queryFn: mealsService.getMyMealTemplates,
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get public meal templates
 */
export function usePublicMealTemplates() {
  return useQuery({
    queryKey: [...queryKeys.meals.templates(), 'public'],
    queryFn: mealsService.getPublicMealTemplates,
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to search meals
 */
export function useSearchMeals(query: string, filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.meals.search(query, filters),
    queryFn: () => mealsService.searchMeals(query, filters),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.MEDIUM,
    enabled: query.length >= 2, // Only search when query is at least 2 characters
  })
}

/**
 * Hook to get meal analysis
 */
export function useMealAnalysis(mealId: string) {
  return useQuery({
    queryKey: queryKeys.meals.analysis(mealId),
    queryFn: () => mealsService.getMealAnalysis(mealId),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!mealId,
  })
}

/**
 * Hook to get meal statistics for a date range
 */
export function useMealStatistics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.meals.all, 'statistics', { startDate, endDate }],
    queryFn: () => mealsService.getMealStatistics(startDate, endDate),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!startDate && !!endDate,
  })
}

// Meal mutation hooks

/**
 * Hook to log a new meal
 * Includes optimistic updates and cache invalidation
 */
export function useLogMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mealData: CreateMealRequest) => mealsService.logMeal(mealData),
    onMutate: async (newMeal) => {
      const date = new Date(newMeal.loggedAt || new Date()).toISOString().split('T')[0]
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.meals.daily(date) })

      // Snapshot the previous value
      const previousMeals = queryClient.getQueryData<Meal[]>(queryKeys.meals.daily(date))

      // Optimistically add the new meal
      const optimisticMeal: Meal = {
        id: `temp_${Date.now()}`,
        userId: 'current-user',
        ...newMeal,
        totalCalories: newMeal.items?.reduce((total, item) => total + item.calories, 0) || 0,
        totalProteinG: newMeal.items?.reduce((total, item) => total + item.proteinG, 0) || 0,
        totalFatG: newMeal.items?.reduce((total, item) => total + item.fatG, 0) || 0,
        totalCarbG: newMeal.items?.reduce((total, item) => total + item.carbG, 0) || 0,
        source: newMeal.source || 'manual',
        aiEstimated: newMeal.aiEstimated || false,
        loggedAt: newMeal.loggedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        items: newMeal.items || [],
      }

      queryClient.setQueryData(queryKeys.meals.daily(date), (old: Meal[] = []) => {
        return [...old, optimisticMeal]
      })

      return { previousMeals, date }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousMeals && context?.date) {
        queryClient.setQueryData(queryKeys.meals.daily(context.date), context.previousMeals)
      }
      console.error('Failed to log meal:', error)
    },
    onSuccess: (data, variables) => {
      const date = new Date(data.loggedAt).toISOString().split('T')[0]
      
      // Invalidate related queries
      getRelatedQueryKeys.onMealsChange(date).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to update an existing meal
 */
export function useUpdateMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mealId, mealData }: { mealId: string; mealData: Partial<Meal> }) =>
      mealsService.updateMeal(mealId, mealData),
    onMutate: async ({ mealId, mealData }) => {
      // Find the meal in cache and get its date
      const allMealQueries = queryClient.getQueriesData({ queryKey: queryKeys.meals.all })
      let targetDate: string | undefined
      let mealsList: Meal[] = []

      for (const [queryKey, data] of allMealQueries) {
        if (Array.isArray(data)) {
          const meal = data.find((m: Meal) => m.id === mealId)
          if (meal) {
            targetDate = new Date(meal.loggedAt).toISOString().split('T')[0]
            mealsList = data
            break
          }
        }
      }

      if (!targetDate) return { previousMeals: undefined, date: undefined }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.meals.daily(targetDate) })

      // Snapshot the previous value
      const previousMeals = queryClient.getQueryData<Meal[]>(queryKeys.meals.daily(targetDate))

      // Optimistically update the meal
      queryClient.setQueryData(queryKeys.meals.daily(targetDate), (old: Meal[] = []) => {
        return old.map(meal => 
          meal.id === mealId 
            ? { ...meal, ...mealData } 
            : meal
        )
      })

      return { previousMeals, date: targetDate }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousMeals && context?.date) {
        queryClient.setQueryData(queryKeys.meals.daily(context.date), context.previousMeals)
      }
      console.error('Failed to update meal:', error)
    },
    onSuccess: (data, variables) => {
      const date = new Date(data.loggedAt).toISOString().split('T')[0]
      
      // Invalidate related queries
      getRelatedQueryKeys.onMealsChange(date).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

/**
 * Hook to delete a meal
 */
export function useDeleteMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mealId: string) => mealsService.deleteMeal(mealId),
    onMutate: async (mealId) => {
      // Find the meal in cache and remove it optimistically
      const allMealQueries = queryClient.getQueriesData({ queryKey: queryKeys.meals.all })
      let targetDate: string | undefined
      let deletedMeal: Meal | undefined

      for (const [queryKey, data] of allMealQueries) {
        if (Array.isArray(data)) {
          const meal = data.find((m: Meal) => m.id === mealId)
          if (meal) {
            targetDate = new Date(meal.loggedAt).toISOString().split('T')[0]
            deletedMeal = meal
            break
          }
        }
      }

      if (!targetDate || !deletedMeal) return { previousMeals: undefined, date: undefined, deletedMeal: undefined }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.meals.daily(targetDate) })

      // Snapshot the previous value
      const previousMeals = queryClient.getQueryData<Meal[]>(queryKeys.meals.daily(targetDate))

      // Optimistically remove the meal
      queryClient.setQueryData(queryKeys.meals.daily(targetDate), (old: Meal[] = []) => {
        return old.filter(meal => meal.id !== mealId)
      })

      return { previousMeals, date: targetDate, deletedMeal }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousMeals && context?.date) {
        queryClient.setQueryData(queryKeys.meals.daily(context.date), context.previousMeals)
      }
      console.error('Failed to delete meal:', error)
    },
    onSuccess: (data, variables, context) => {
      if (context?.date) {
        // Invalidate related queries
        getRelatedQueryKeys.onMealsChange(context.date).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
    },
  })
}

/**
 * Hook to create a meal template
 */
export function useCreateMealTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateData: CreateMealTemplateRequest) => mealsService.createMealTemplate(templateData),
    onSuccess: () => {
      // Invalidate meal templates queries
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.templates() })
    },
    onError: (error) => {
      console.error('Failed to create meal template:', error)
    },
  })
}

/**
 * Hook to update a meal template
 */
export function useUpdateMealTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, templateData }: { templateId: string; templateData: Partial<MealTemplate> }) =>
      mealsService.updateMealTemplate(templateId, templateData),
    onSuccess: () => {
      // Invalidate meal templates queries
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.templates() })
    },
    onError: (error) => {
      console.error('Failed to update meal template:', error)
    },
  })
}

/**
 * Hook to delete a meal template
 */
export function useDeleteMealTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => mealsService.deleteMealTemplate(templateId),
    onSuccess: () => {
      // Invalidate meal templates queries
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.templates() })
    },
    onError: (error) => {
      console.error('Failed to delete meal template:', error)
    },
  })
}

/**
 * Hook to use a meal template (create meal from template)
 */
export function useUseMealTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, params }: { templateId: string; params: UseMealTemplateRequest }) =>
      mealsService.useMealTemplate(templateId, params),
    onSuccess: (data) => {
      const date = new Date(data.loggedAt).toISOString().split('T')[0]
      
      // Invalidate related queries
      getRelatedQueryKeys.onMealsChange(date).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (error) => {
      console.error('Failed to use meal template:', error)
    },
  })
}

/**
 * Hook to copy a meal to another date
 */
export function useCopyMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mealId, targetDate }: { mealId: string; targetDate: string }) =>
      mealsService.copyMeal(mealId, targetDate),
    onSuccess: (data, variables) => {
      // Invalidate related queries for the target date
      getRelatedQueryKeys.onMealsChange(variables.targetDate).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (error) => {
      console.error('Failed to copy meal:', error)
    },
  })
}

/**
 * Hook to bulk log multiple meals
 */
export function useBulkLogMeals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (meals: CreateMealRequest[]) => mealsService.bulkLogMeals(meals),
    onSuccess: (data) => {
      // Get all unique dates from the logged meals
      const uniqueDates = [...new Set(data.map(meal => 
        new Date(meal.loggedAt).toISOString().split('T')[0]
      ))]

      // Invalidate related queries for all affected dates
      uniqueDates.forEach(date => {
        getRelatedQueryKeys.onMealsChange(date).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      })
    },
    onError: (error) => {
      console.error('Failed to bulk log meals:', error)
    },
  })
}
