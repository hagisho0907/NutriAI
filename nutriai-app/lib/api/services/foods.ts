// Foods API service
import { apiClient } from '../client'
import type {
  Food,
  CustomFood,
  FoodRecommendation,
  FoodAlternatives,
  FoodComparison,
  FoodUsageStats,
  BatchBarcodeSearchResult,
} from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

export interface FoodSearchParams {
  q: string
  limit?: number
  offset?: number
  category?: string
}

export interface CustomFoodParams {
  limit?: number
  offset?: number
}

export interface CreateCustomFoodRequest extends Omit<CustomFood, 'id' | 'createdAt'> {
  // Custom food creation request
}

export interface FoodImageAnalysisResponse {
  foods: Array<{
    name: string
    confidence: number
    estimatedQuantity: number
    unit: string
    nutrition: {
      calories: number
      proteinG: number
      fatG: number
      carbG: number
    }
  }>
  totalNutrition: {
    calories: number
    proteinG: number
    fatG: number
    carbG: number
  }
  suggestions: string[]
}

export const foodsService = {
  // Search foods by query
  async searchFoods(params: FoodSearchParams): Promise<PaginatedResponse<Food>> {
    const searchParams = new URLSearchParams()
    
    searchParams.set('q', params.q)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.category) searchParams.set('category', params.category)

    const response = await apiClient.get<PaginatedResponse<Food>>(`/api/foods/search?${searchParams}`)
    return response.data
  },

  // Search food by barcode
  async searchByBarcode(barcode: string): Promise<Food> {
    const response = await apiClient.get<Food>(`/api/foods/barcode/${barcode}`)
    return response.data
  },

  // Get food by ID
  async getFoodById(foodId: string): Promise<Food> {
    const response = await apiClient.get<Food>(`/api/foods/${foodId}`)
    return response.data
  },

  // Get food categories
  async getFoodCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/api/foods/categories')
    return response.data
  },

  // Get popular foods
  async getPopularFoods(limit = 10): Promise<Food[]> {
    const response = await apiClient.get<Food[]>(`/api/foods/popular?limit=${limit}`)
    return response.data
  },

  // Get recently used foods
  async getRecentFoods(limit = 10): Promise<Food[]> {
    const response = await apiClient.get<Food[]>(`/api/foods/recent?limit=${limit}`)
    return response.data
  },

  // Get custom foods
  async getCustomFoods(params: CustomFoodParams = {}): Promise<PaginatedResponse<CustomFood>> {
    const searchParams = new URLSearchParams()
    
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const response = await apiClient.get<PaginatedResponse<CustomFood>>(`/api/foods/custom?${searchParams}`)
    return response.data
  },

  // Create custom food
  async createCustomFood(foodData: CreateCustomFoodRequest): Promise<CustomFood> {
    const response = await apiClient.post<CustomFood>('/api/foods/custom', foodData)
    return response.data
  },

  // Update custom food
  async updateCustomFood(foodId: string, foodData: Partial<CustomFood>): Promise<CustomFood> {
    const response = await apiClient.put<CustomFood>(`/api/foods/custom/${foodId}`, foodData)
    return response.data
  },

  // Delete custom food
  async deleteCustomFood(foodId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/foods/custom/${foodId}`)
    return response.data
  },

  // Analyze food image using AI
  async analyzeFoodImage(imageFile: File): Promise<FoodImageAnalysisResponse> {
    const formData = new FormData()
    formData.append('image', imageFile)

    // Note: For file uploads, we need to handle the request differently
    const response = await fetch('/api/foods/analyze-image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to analyze food image')
    }

    return response.json()
  },

  // Helper method to get auth token
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (!authStorage) return null
      
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || null
    } catch {
      return null
    }
  },

  // Get food recommendations based on user preferences and goals
  async getFoodRecommendations(params?: {
    goal?: 'weight_loss' | 'muscle_gain' | 'maintenance'
    dietaryRestrictions?: string[]
    preferredCategories?: string[]
    limit?: number
  }): Promise<FoodRecommendation> {
    const searchParams = new URLSearchParams()
    
    if (params?.goal) searchParams.set('goal', params.goal)
    if (params?.dietaryRestrictions) searchParams.set('dietaryRestrictions', params.dietaryRestrictions.join(','))
    if (params?.preferredCategories) searchParams.set('preferredCategories', params.preferredCategories.join(','))
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const response = await apiClient.get<FoodRecommendation>(`/api/foods/recommendations?${searchParams}`)
    return response.data
  },

  // Get food alternatives/substitutes
  async getFoodAlternatives(foodId: string, criteria?: {
    lowerCalories?: boolean
    higherProtein?: boolean
    lowerCarbs?: boolean
    sameFoodGroup?: boolean
  }): Promise<FoodAlternatives> {
    const searchParams = new URLSearchParams()
    
    if (criteria?.lowerCalories) searchParams.set('lowerCalories', 'true')
    if (criteria?.higherProtein) searchParams.set('higherProtein', 'true')
    if (criteria?.lowerCarbs) searchParams.set('lowerCarbs', 'true')
    if (criteria?.sameFoodGroup) searchParams.set('sameFoodGroup', 'true')

    const response = await apiClient.get<FoodAlternatives>(`/api/foods/${foodId}/alternatives?${searchParams}`)
    return response.data
  },

  // Get nutrition comparison between foods
  async compareFoods(foodIds: string[]): Promise<FoodComparison> {
    const response = await apiClient.post<FoodComparison>('/api/foods/compare', { foodIds })
    return response.data
  },

  // Get favorite foods
  async getFavoriteFoods(): Promise<Food[]> {
    const response = await apiClient.get<Food[]>('/api/foods/favorites')
    return response.data
  },

  // Add food to favorites
  async addToFavorites(foodId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/api/foods/${foodId}/favorite`)
    return response.data
  },

  // Remove food from favorites
  async removeFromFavorites(foodId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/foods/${foodId}/favorite`)
    return response.data
  },

  // Get food usage statistics
  async getFoodUsageStats(foodId: string): Promise<FoodUsageStats> {
    const response = await apiClient.get<FoodUsageStats>(`/api/foods/${foodId}/stats`)
    return response.data
  },

  // Search foods with advanced filters
  async advancedFoodSearch(params: {
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
  }): Promise<PaginatedResponse<Food & { relevanceScore?: number }>> {
    const searchParams = new URLSearchParams()
    
    if (params.query) searchParams.set('q', params.query)
    if (params.categories) searchParams.set('categories', params.categories.join(','))
    if (params.minProtein) searchParams.set('minProtein', params.minProtein.toString())
    if (params.maxCalories) searchParams.set('maxCalories', params.maxCalories.toString())
    if (params.minFiber) searchParams.set('minFiber', params.minFiber.toString())
    if (params.maxFat) searchParams.set('maxFat', params.maxFat.toString())
    if (params.allergenFree) searchParams.set('allergenFree', params.allergenFree.join(','))
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const response = await apiClient.get<PaginatedResponse<Food & { relevanceScore?: number }>>(`/api/foods/search/advanced?${searchParams}`)
    return response.data
  },

  // Get foods by multiple barcodes (batch lookup)
  async batchBarcodeSearch(barcodes: string[]): Promise<BatchBarcodeSearchResult> {
    const response = await apiClient.post<BatchBarcodeSearchResult>('/api/foods/barcode/batch', { barcodes })
    return response.data
  },
}
