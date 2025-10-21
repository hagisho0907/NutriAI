// Foods hooks for React Query
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { 
  foodsService, 
  type FoodSearchParams, 
  type CustomFoodParams, 
  type CreateCustomFoodRequest 
} from '../../api/services/foods'
import { queryKeys } from '../query-keys'
import { STALE_TIME, CACHE_TIME } from '../config'
import type { Food, CustomFood } from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

// Foods query hooks

/**
 * Hook to search foods by query
 */
export function useSearchFoods(params: FoodSearchParams) {
  const filters = { ...params } as Record<string, unknown>
  return useQuery({
    queryKey: queryKeys.foods.search(params.q, filters),
    queryFn: () => foodsService.searchFoods(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: params.q.length >= 2, // Only search when query is at least 2 characters
  })
}

/**
 * Infinite query hook for food search with pagination
 */
export function useInfiniteSearchFoods(params: Omit<FoodSearchParams, 'offset'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.foods.search(params.q, { ...params, infinite: true }),
    queryFn: ({ pageParam = 0 }) =>
      foodsService.searchFoods({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Food>) => {
      if (!lastPage.pagination.hasMore) return undefined
      return lastPage.pagination.offset + lastPage.pagination.limit
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: params.q.length >= 2,
  })
}

/**
 * Hook to search food by barcode
 */
export function useSearchByBarcode(barcode: string) {
  return useQuery({
    queryKey: queryKeys.foods.barcode(barcode),
    queryFn: () => foodsService.searchByBarcode(barcode),
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!barcode && barcode.length >= 8,
    retry: false, // Don't retry barcode searches
  })
}

/**
 * Hook to get food by ID
 */
export function useFoodById(foodId: string) {
  return useQuery({
    queryKey: queryKeys.foods.detail(foodId),
    queryFn: () => foodsService.getFoodById(foodId),
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!foodId,
  })
}

/**
 * Hook to get food categories
 */
export function useFoodCategories() {
  return useQuery({
    queryKey: [...queryKeys.foods.all, 'categories'],
    queryFn: foodsService.getFoodCategories,
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get popular foods
 */
export function usePopularFoods(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.foods.all, 'popular', { limit }],
    queryFn: () => foodsService.getPopularFoods(limit),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get recent foods
 */
export function useRecentFoods(limit = 10) {
  return useQuery({
    queryKey: queryKeys.foods.recent(),
    queryFn: () => foodsService.getRecentFoods(limit),
    staleTime: STALE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  })
}

/**
 * Hook to get custom foods
 */
export function useCustomFoods(params: CustomFoodParams = {}) {
  return useQuery({
    queryKey: queryKeys.foods.custom(),
    queryFn: () => foodsService.getCustomFoods(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Infinite query hook for custom foods
 */
export function useInfiniteCustomFoods(params: Omit<CustomFoodParams, 'offset'> = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.foods.custom(), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      foodsService.getCustomFoods({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<CustomFood>) => {
      if (!lastPage.pagination.hasMore) return undefined
      return lastPage.pagination.offset + lastPage.pagination.limit
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get favorite foods
 */
export function useFavoriteFoods() {
  return useQuery({
    queryKey: queryKeys.foods.favorites(),
    queryFn: foodsService.getFavoriteFoods,
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get food recommendations
 */
export function useFoodRecommendations(params?: {
  goal?: 'weight_loss' | 'muscle_gain' | 'maintenance'
  dietaryRestrictions?: string[]
  preferredCategories?: string[]
  limit?: number
}) {
  const filters = params ? { ...params } : undefined
  return useQuery({
    queryKey: queryKeys.foods.recommendations(filters),
    queryFn: () => foodsService.getFoodRecommendations(params),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get food alternatives
 */
export function useFoodAlternatives(
  foodId: string, 
  criteria?: {
    lowerCalories?: boolean
    higherProtein?: boolean
    lowerCarbs?: boolean
    sameFoodGroup?: boolean
  }
) {
  const criteriaFilters = criteria ? { ...criteria } : undefined
  return useQuery({
    queryKey: [...queryKeys.foods.all, 'alternatives', foodId, criteriaFilters],
    queryFn: () => foodsService.getFoodAlternatives(foodId, criteria),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!foodId,
  })
}

/**
 * Hook to get food usage statistics
 */
export function useFoodUsageStats(foodId: string) {
  return useQuery({
    queryKey: [...queryKeys.foods.all, 'stats', foodId],
    queryFn: () => foodsService.getFoodUsageStats(foodId),
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    enabled: !!foodId,
  })
}

/**
 * Hook for advanced food search
 */
export function useAdvancedFoodSearch(params: {
  query?: string
  categories?: string[]
  minProtein?: number
  maxCalories?: number
  minFiber?: number
  maxFat?: number
  allergenFree?: string[]
  sortBy?: 'relevance' | 'calories' | 'protein' | 'popularity'
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: [...queryKeys.foods.all, 'advanced-search', JSON.stringify(params)],
    queryFn: () => foodsService.advancedFoodSearch(params),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!(params.query && params.query.length >= 2) || 
             !!(params.categories && params.categories.length > 0) ||
             !!(params.minProtein || params.maxCalories || params.minFiber || params.maxFat),
  })
}

// Foods mutation hooks

/**
 * Hook to create custom food
 */
export function useCreateCustomFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (foodData: CreateCustomFoodRequest) => foodsService.createCustomFood(foodData),
    onSuccess: (newFood) => {
      // Add the new food to the custom foods cache
      queryClient.setQueryData(
        queryKeys.foods.custom(),
        (old: PaginatedResponse<CustomFood> | undefined) => {
          if (!old) {
            return {
              items: [newFood],
              pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
            }
          }

          return {
            ...old,
            items: [newFood, ...old.items],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          }
        }
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.foods.custom() })
    },
    onError: (error) => {
      console.error('Failed to create custom food:', error)
    },
  })
}

/**
 * Hook to update custom food
 */
export function useUpdateCustomFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ foodId, foodData }: { foodId: string; foodData: Partial<CustomFood> }) =>
      foodsService.updateCustomFood(foodId, foodData),
    onMutate: async ({ foodId, foodData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.foods.custom() })

      // Snapshot the previous value
      const previousCustomFoods = queryClient.getQueryData<PaginatedResponse<CustomFood>>(queryKeys.foods.custom())

      // Optimistically update the food
      if (previousCustomFoods) {
        queryClient.setQueryData(queryKeys.foods.custom(), {
          ...previousCustomFoods,
          items: previousCustomFoods.items.map(food =>
            food.id === foodId ? { ...food, ...foodData } : food
          ),
        })
      }

      return { previousCustomFoods }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousCustomFoods) {
        queryClient.setQueryData(queryKeys.foods.custom(), context.previousCustomFoods)
      }
      console.error('Failed to update custom food:', error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.foods.custom() })
    },
  })
}

/**
 * Hook to delete custom food
 */
export function useDeleteCustomFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (foodId: string) => foodsService.deleteCustomFood(foodId),
    onMutate: async (foodId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.foods.custom() })

      // Snapshot the previous value
      const previousCustomFoods = queryClient.getQueryData<PaginatedResponse<CustomFood>>(queryKeys.foods.custom())

      // Optimistically remove the food
      if (previousCustomFoods) {
        queryClient.setQueryData(queryKeys.foods.custom(), {
          ...previousCustomFoods,
          items: previousCustomFoods.items.filter(food => food.id !== foodId),
          pagination: {
            ...previousCustomFoods.pagination,
            total: Math.max(0, previousCustomFoods.pagination.total - 1),
          },
        })
      }

      return { previousCustomFoods }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousCustomFoods) {
        queryClient.setQueryData(queryKeys.foods.custom(), context.previousCustomFoods)
      }
      console.error('Failed to delete custom food:', error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.foods.custom() })
    },
  })
}

/**
 * Hook to analyze food image
 */
export function useAnalyzeFoodImage() {
  return useMutation({
    mutationFn: (imageFile: File) => foodsService.analyzeFoodImage(imageFile),
    onError: (error) => {
      console.error('Failed to analyze food image:', error)
    },
  })
}

/**
 * Hook to add food to favorites
 */
export function useAddToFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (foodId: string) => foodsService.addToFavorites(foodId),
    onMutate: async (foodId) => {
      // Get the food details to add to favorites
      const food = queryClient.getQueryData<Food>(queryKeys.foods.detail(foodId))
      
      if (food) {
        // Optimistically add to favorites
        queryClient.setQueryData(queryKeys.foods.favorites(), (old: Food[] = []) => {
          return [food, ...old.filter(f => f.id !== foodId)]
        })
      }

      return { food }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.food) {
        queryClient.setQueryData(queryKeys.foods.favorites(), (old: Food[] = []) => {
          return old.filter(f => f.id !== variables)
        })
      }
      console.error('Failed to add to favorites:', error)
    },
    onSettled: () => {
      // Always refetch favorites
      queryClient.invalidateQueries({ queryKey: queryKeys.foods.favorites() })
    },
  })
}

/**
 * Hook to remove food from favorites
 */
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (foodId: string) => foodsService.removeFromFavorites(foodId),
    onMutate: async (foodId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.foods.favorites() })

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Food[]>(queryKeys.foods.favorites())

      // Optimistically remove from favorites
      queryClient.setQueryData(queryKeys.foods.favorites(), (old: Food[] = []) => {
        return old.filter(food => food.id !== foodId)
      })

      return { previousFavorites }
    },
    onError: (error, variables, context) => {
      // Roll back on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.foods.favorites(), context.previousFavorites)
      }
      console.error('Failed to remove from favorites:', error)
    },
    onSettled: () => {
      // Always refetch favorites
      queryClient.invalidateQueries({ queryKey: queryKeys.foods.favorites() })
    },
  })
}

/**
 * Hook to compare foods
 */
export function useCompareFoods() {
  return useMutation({
    mutationFn: (foodIds: string[]) => foodsService.compareFoods(foodIds),
    onError: (error) => {
      console.error('Failed to compare foods:', error)
    },
  })
}

/**
 * Hook to batch search barcodes
 */
export function useBatchBarcodeSearch() {
  return useMutation({
    mutationFn: (barcodes: string[]) => foodsService.batchBarcodeSearch(barcodes),
    onError: (error) => {
      console.error('Failed to batch search barcodes:', error)
    },
  })
}

/**
 * Utility hook to check if a food is in favorites
 */
export function useIsFavoriteFood(foodId: string) {
  const { data: favorites = [] } = useFavoriteFoods()
  
  return {
    isFavorite: favorites.some(food => food.id === foodId),
    favoritesCount: favorites.length,
  }
}

/**
 * Hook to get food suggestions based on current meal context
 */
export function useFoodSuggestions(context?: {
  mealType?: string
  currentMealCalories?: number
  targetTotalCalories?: number
  preferredMacros?: { protein?: number; carbs?: number; fat?: number }
}) {
  return useQuery({
    queryKey: [...queryKeys.foods.all, 'suggestions', context],
    queryFn: async () => {
      // This would be a real API endpoint for getting suggestions
      // For now, return recommendations based on popular foods
      return foodsService.getPopularFoods(10)
    },
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: !!context,
  })
}
