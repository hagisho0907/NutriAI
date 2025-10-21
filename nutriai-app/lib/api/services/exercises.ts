// Exercises API service
import { apiClient } from '../client'
import type {
  ExerciseLog,
  ExerciseTemplate,
  ExerciseRecommendation,
  WeeklyExerciseSummary,
} from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

export interface ExerciseLogParams {
  date?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface CreateExerciseLogRequest extends Omit<ExerciseLog, 'id' | 'userId' | 'createdAt'> {
  // Exercise log creation request
}

export interface ExerciseSearchParams {
  q: string
  category?: string
  limit?: number
  offset?: number
}

export interface ExerciseStatsParams {
  startDate: string
  endDate: string
}

export interface CalorieCalculationRequest {
  templateId?: string
  templateName?: string
  durationMin: number
  weightKg?: number
  intensityLevel?: string
}

export interface CalorieCalculationResponse {
  estimatedCalories: number
  metValue: number
  durationMin: number
  weightKg: number
}

export interface ExerciseStats {
  totalExercises: number
  totalDurationMin: number
  totalCaloriesBurned: number
  averageDurationMin: number
  averageCaloriesPerSession: number
  exercisesByCategory: Record<string, number>
  exercisesByIntensity: Record<string, number>
}

export const exercisesService = {
  // Get exercise log (with filtering and pagination)
  async getExerciseLog(params: ExerciseLogParams = {}): Promise<PaginatedResponse<ExerciseLog>> {
    const searchParams = new URLSearchParams()
    
    if (params.date) searchParams.set('date', params.date)
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const response = await apiClient.get<PaginatedResponse<ExerciseLog>>(`/api/exercises/log?${searchParams}`)
    return response.data
  },

  // Get exercises for a specific date
  async getDailyExercises(date: string): Promise<ExerciseLog[]> {
    const response = await apiClient.get<PaginatedResponse<ExerciseLog>>(`/api/exercises/log?date=${date}`)
    return response.data.items
  },

  // Log a new exercise
  async logExercise(exerciseData: CreateExerciseLogRequest): Promise<ExerciseLog> {
    const response = await apiClient.post<ExerciseLog>('/api/exercises/log', exerciseData)
    return response.data
  },

  // Update an existing exercise log
  async updateExerciseLog(exerciseId: string, exerciseData: Partial<ExerciseLog>): Promise<ExerciseLog> {
    const response = await apiClient.put<ExerciseLog>(`/api/exercises/log/${exerciseId}`, exerciseData)
    return response.data
  },

  // Delete an exercise log
  async deleteExerciseLog(exerciseId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/exercises/log/${exerciseId}`)
    return response.data
  },

  // Search exercise templates
  async searchExercises(params: ExerciseSearchParams): Promise<PaginatedResponse<ExerciseTemplate>> {
    const searchParams = new URLSearchParams()
    
    searchParams.set('q', params.q)
    if (params.category) searchParams.set('category', params.category)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const response = await apiClient.get<PaginatedResponse<ExerciseTemplate>>(`/api/exercises/search?${searchParams}`)
    return response.data
  },

  // Get exercise templates
  async getExerciseTemplates(params: { category?: string; limit?: number; offset?: number } = {}): Promise<PaginatedResponse<ExerciseTemplate>> {
    const searchParams = new URLSearchParams()
    
    if (params.category) searchParams.set('category', params.category)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const response = await apiClient.get<PaginatedResponse<ExerciseTemplate>>(`/api/exercises/templates?${searchParams}`)
    return response.data
  },

  // Get exercise categories
  async getExerciseCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/api/exercises/categories')
    return response.data
  },

  // Get exercise statistics for a date range
  async getExerciseStats(params: ExerciseStatsParams): Promise<ExerciseStats> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    })

    const response = await apiClient.get<ExerciseStats>(`/api/exercises/stats?${searchParams}`)
    return response.data
  },

  // Calculate calories burned for an exercise
  async calculateCalories(params: CalorieCalculationRequest): Promise<CalorieCalculationResponse> {
    const response = await apiClient.post<CalorieCalculationResponse>('/api/exercises/calculate-calories', params)
    return response.data
  },

  // Get exercise history for analytics
  async getExerciseHistory(startDate: string, endDate: string, limit = 100, offset = 0): Promise<PaginatedResponse<ExerciseLog>> {
    return this.getExerciseLog({ startDate, endDate, limit, offset })
  },

  // Get popular exercises (could be based on usage stats)
  async getPopularExercises(limit = 10): Promise<ExerciseTemplate[]> {
    const response = await apiClient.get<PaginatedResponse<ExerciseTemplate>>(`/api/exercises/templates?limit=${limit}`)
    return response.data.items
  },

  // Get exercise by template ID
  async getExerciseTemplate(templateId: string): Promise<ExerciseTemplate> {
    const response = await apiClient.get<ExerciseTemplate>(`/api/exercises/templates/${templateId}`)
    return response.data
  },

  // Bulk log multiple exercises
  async bulkLogExercises(exercises: CreateExerciseLogRequest[]): Promise<ExerciseLog[]> {
    const response = await apiClient.post<ExerciseLog[]>('/api/exercises/log/bulk', { exercises })
    return response.data
  },

  // Copy exercise to another date
  async copyExercise(exerciseId: string, targetDate: string): Promise<ExerciseLog> {
    const response = await apiClient.post<ExerciseLog>(`/api/exercises/log/${exerciseId}/copy`, { targetDate })
    return response.data
  },

  // Get exercise recommendations based on user's history and goals
  async getExerciseRecommendations(params?: { 
    category?: string
    intensityLevel?: string
    durationMin?: number
    limit?: number 
  }): Promise<ExerciseRecommendation> {
    const searchParams = new URLSearchParams()
    
    if (params?.category) searchParams.set('category', params.category)
    if (params?.intensityLevel) searchParams.set('intensityLevel', params.intensityLevel)
    if (params?.durationMin) searchParams.set('durationMin', params.durationMin.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const response = await apiClient.get<ExerciseRecommendation>(`/api/exercises/recommendations?${searchParams}`)
    return response.data
  },

  // Get weekly exercise summary
  async getWeeklyExerciseSummary(startDate: string): Promise<WeeklyExerciseSummary> {
    const response = await apiClient.get<WeeklyExerciseSummary>(`/api/exercises/weekly-summary?startDate=${startDate}`)
    return response.data
  },
}
