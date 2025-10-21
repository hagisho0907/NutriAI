// Nutrition API service
import { apiClient } from '../client'
import type { NutritionGoals, DailyNutrition, NutrientBalance, NutritionSummary } from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

export const nutritionService = {
  // Get nutrition goals
  async getGoals(): Promise<NutritionGoals> {
    const response = await apiClient.get<NutritionGoals>('/api/nutrition/goals')
    return response.data
  },

  // Update nutrition goals
  async updateGoals(goals: Partial<NutritionGoals>): Promise<NutritionGoals> {
    const response = await apiClient.put<NutritionGoals>('/api/nutrition/goals', goals)
    return response.data
  },

  // Get daily nutrition for specific date
  async getDailyNutrition(date: string): Promise<DailyNutrition> {
    const response = await apiClient.get<DailyNutrition>(`/api/nutrition/daily?date=${date}`)
    return response.data
  },

  // Get nutrition history
  async getNutritionHistory(startDate: string, endDate: string, limit = 30, offset = 0): Promise<PaginatedResponse<DailyNutrition>> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    const response = await apiClient.get<PaginatedResponse<DailyNutrition>>(`/api/nutrition/history?${params}`)
    return response.data
  },

  // Get nutrition summary for a date
  async getNutritionSummary(date: string): Promise<NutritionSummary> {
    const response = await apiClient.get<NutritionSummary>(`/api/nutrition/summary?date=${date}`)
    return response.data
  },

  // Log water intake
  async logWater(amount: number, date?: string): Promise<{ waterIntake: number; date: Date }> {
    const body = { amount, ...(date && { date }) }
    const response = await apiClient.post<{ waterIntake: number; date: Date }>('/api/nutrition/water', body)
    return response.data
  },
}
