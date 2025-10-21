// Meals API service
import { apiClient } from '../client'
import type {
  Meal,
  MealTemplate,
  MealItem,
  MealAnalysis,
  MealStatistics,
} from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

export interface MealLogParams {
  date?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface CreateMealRequest extends Omit<Meal, 'id' | 'userId' | 'createdAt' | 'totalCalories' | 'totalProteinG' | 'totalFatG' | 'totalCarbG'> {
  // Totals will be calculated on the server
}

export interface CreateMealTemplateRequest extends Omit<MealTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  // Template creation request
}

export interface UseMealTemplateRequest {
  mealType: string
  loggedAt?: string
}

export const mealsService = {
  // Get meal log (with filtering and pagination)
  async getMealLog(params: MealLogParams = {}): Promise<PaginatedResponse<Meal>> {
    const searchParams = new URLSearchParams()
    
    if (params.date) searchParams.set('date', params.date)
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const response = await apiClient.get<PaginatedResponse<Meal>>(`/api/meals/log?${searchParams}`)
    return response.data
  },

  // Get meals for a specific date
  async getDailyMeals(date: string): Promise<Meal[]> {
    const response = await apiClient.get<PaginatedResponse<Meal>>(`/api/meals/log?date=${date}`)
    return response.data.items
  },

  // Log a new meal
  async logMeal(mealData: CreateMealRequest): Promise<Meal> {
    const response = await apiClient.post<Meal>('/api/meals/log', mealData)
    return response.data
  },

  // Update an existing meal
  async updateMeal(mealId: string, mealData: Partial<Meal>): Promise<Meal> {
    const response = await apiClient.put<Meal>(`/api/meals/log/${mealId}`, mealData)
    return response.data
  },

  // Delete a meal
  async deleteMeal(mealId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/meals/log/${mealId}`)
    return response.data
  },

  // Get meal templates
  async getMealTemplates(params: { limit?: number; offset?: number; public?: boolean } = {}): Promise<PaginatedResponse<MealTemplate>> {
    const searchParams = new URLSearchParams()
    
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.public !== undefined) searchParams.set('public', params.public.toString())

    const response = await apiClient.get<PaginatedResponse<MealTemplate>>(`/api/meals/templates?${searchParams}`)
    return response.data
  },

  // Get user's custom meal templates
  async getMyMealTemplates(): Promise<MealTemplate[]> {
    const response = await apiClient.get<PaginatedResponse<MealTemplate>>('/api/meals/templates?public=false')
    return response.data.items
  },

  // Get public meal templates
  async getPublicMealTemplates(): Promise<MealTemplate[]> {
    const response = await apiClient.get<PaginatedResponse<MealTemplate>>('/api/meals/templates?public=true')
    return response.data.items
  },

  // Create a new meal template
  async createMealTemplate(templateData: CreateMealTemplateRequest): Promise<MealTemplate> {
    const response = await apiClient.post<MealTemplate>('/api/meals/templates', templateData)
    return response.data
  },

  // Update an existing meal template
  async updateMealTemplate(templateId: string, templateData: Partial<MealTemplate>): Promise<MealTemplate> {
    const response = await apiClient.put<MealTemplate>(`/api/meals/templates/${templateId}`, templateData)
    return response.data
  },

  // Delete a meal template
  async deleteMealTemplate(templateId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/meals/templates/${templateId}`)
    return response.data
  },

  // Use a meal template to create a new meal
  async useMealTemplate(templateId: string, params: UseMealTemplateRequest): Promise<Meal> {
    const response = await apiClient.post<Meal>(`/api/meals/templates/${templateId}/use`, params)
    return response.data
  },

  // Search meals (this would be implemented if there's a search endpoint)
  async searchMeals(query: string, filters?: Record<string, unknown>): Promise<Meal[]> {
    const searchParams = new URLSearchParams({ q: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      })
    }

    // This endpoint would need to be implemented in MSW handlers
    const response = await apiClient.get<PaginatedResponse<Meal>>(`/api/meals/search?${searchParams}`)
    return response.data.items
  },

  // Get meal analysis (nutrition breakdown, AI insights)
  async getMealAnalysis(mealId: string): Promise<MealAnalysis> {
    // This would be a real API endpoint for meal analysis
    const response = await apiClient.get<MealAnalysis>(`/api/meals/log/${mealId}/analysis`)
    return response.data
  },

  // Bulk operations for efficient meal logging
  async bulkLogMeals(meals: CreateMealRequest[]): Promise<Meal[]> {
    const response = await apiClient.post<Meal[]>('/api/meals/log/bulk', { meals })
    return response.data
  },

  // Copy meal to another date
  async copyMeal(mealId: string, targetDate: string): Promise<Meal> {
    const response = await apiClient.post<Meal>(`/api/meals/log/${mealId}/copy`, { targetDate })
    return response.data
  },

  // Get meal statistics for a period
  async getMealStatistics(startDate: string, endDate: string): Promise<MealStatistics> {
    const response = await apiClient.get<MealStatistics>(`/api/meals/statistics?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },
}
