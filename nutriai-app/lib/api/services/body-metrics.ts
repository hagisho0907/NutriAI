// Body Metrics API service
import { apiClient } from '../client'
import type { BodyMetrics } from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

export interface BodyMetricsParams {
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface CreateBodyMetricsRequest extends Omit<BodyMetrics, 'id' | 'userId' | 'createdAt'> {
  // Body metrics creation request
}

export interface BodyMetricsStatsParams {
  startDate: string
  endDate: string
}

export interface BodyMetricsStats {
  totalMeasurements: number
  weightChange: {
    absolute: number
    percentage: number
  } | null
  bodyFatChange: {
    absolute: number
    percentage: number
  } | null
  trends: {
    weight: 'increasing' | 'decreasing' | 'stable'
    bodyFat: 'increasing' | 'decreasing' | 'stable'
  }
  averages: {
    weight: number
    bodyFat: number | null
  } | null
}

export interface BodyMetricsProgress {
  period: string
  dataPoints: Array<{
    date: string
    weight: number
    bodyFat?: number
    muscleMass?: number
    visceralFat?: number
    bmr?: number
  }>
  summary: {
    totalMeasurements: number
    firstMeasurement: {
      date: string
      weight: number
      bodyFat?: number
    } | null
    lastMeasurement: {
      date: string
      weight: number
      bodyFat?: number
    } | null
  }
}

export interface BMICalculationResult {
  bmi: number
  category: 'underweight' | 'normal' | 'overweight' | 'obese'
  healthyWeightRange: {
    min: number
    max: number
  }
}

export interface BodyCompositionAnalysisResult {
  metrics: BodyMetrics
  analysis: {
    bmi: number
    bmiCategory: string
    bodyFatCategory?: string
    muscleMassCategory?: string
    metabolicAge?: number
    recommendations: string[]
  }
  trends: {
    weightTrend: 'up' | 'down' | 'stable'
    bodyFatTrend: 'up' | 'down' | 'stable'
    muscleMassTrend: 'up' | 'down' | 'stable'
  }
}

export interface WeeklyBodyMetricsSummary {
  startDate: string
  endDate: string
  measurementCount: number
  averageWeight: number
  weightChange: number
  averageBodyFat?: number
  bodyFatChange?: number
  weeklyGoals: {
    targetWeightChange: number
    actualWeightChange: number
    onTrack: boolean
  }
  insights: string[]
}

export interface BodyMetricsTrends {
  metric: string
  period: string
  trend: 'increasing' | 'decreasing' | 'stable'
  changeRate: number
  predictions: Array<{
    date: string
    predictedValue: number
    confidence: number
  }>
  recommendations: string[]
}

export interface BodyMetricsExportResponse {
  data: BodyMetrics[]
  exportUrl?: string
  filename: string
}

export interface BulkImportBodyMetricsResponse {
  imported: BodyMetrics[]
  failed: Array<{
    data: CreateBodyMetricsRequest
    error: string
  }>
  summary: {
    total: number
    successful: number
    failed: number
  }
}

export interface IdealWeightRecommendations {
  idealWeightRange: {
    min: number
    max: number
    target: number
  }
  recommendations: {
    weightLoss?: {
      targetWeightKg: number
      timelineWeeks: number
      weeklyGoal: number
    }
    weightGain?: {
      targetWeightKg: number
      timelineWeeks: number
      weeklyGoal: number
    }
    maintenance?: {
      targetWeightKg: number
      allowedVariation: number
    }
  }
  healthMetrics: {
    bmiRange: { min: number; max: number }
    bodyFatRange?: { min: number; max: number }
  }
}

export const bodyMetricsService = {
  // Get body metrics with filtering and pagination
  async getBodyMetrics(params: BodyMetricsParams = {}): Promise<PaginatedResponse<BodyMetrics>> {
    const searchParams = new URLSearchParams()
    
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const response = await apiClient.get<PaginatedResponse<BodyMetrics>>(`/api/body-metrics?${searchParams}`)
    return response.data
  },

  // Get the latest body metrics
  async getLatestBodyMetrics(): Promise<BodyMetrics | null> {
    const response = await apiClient.get<BodyMetrics | null>('/api/body-metrics/latest')
    return response.data
  },

  // Add new body metrics
  async addBodyMetrics(metricsData: CreateBodyMetricsRequest): Promise<BodyMetrics> {
    const response = await apiClient.post<BodyMetrics>('/api/body-metrics', metricsData)
    return response.data
  },

  // Update existing body metrics
  async updateBodyMetrics(metricsId: string, metricsData: Partial<BodyMetrics>): Promise<BodyMetrics> {
    const response = await apiClient.put<BodyMetrics>(`/api/body-metrics/${metricsId}`, metricsData)
    return response.data
  },

  // Delete body metrics
  async deleteBodyMetrics(metricsId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/body-metrics/${metricsId}`)
    return response.data
  },

  // Get body metrics statistics for a date range
  async getBodyMetricsStats(params: BodyMetricsStatsParams): Promise<BodyMetricsStats> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    })

    const response = await apiClient.get<BodyMetricsStats>(`/api/body-metrics/stats?${searchParams}`)
    return response.data
  },

  // Get body metrics progress over time
  async getBodyMetricsProgress(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<BodyMetricsProgress> {
    const response = await apiClient.get<BodyMetricsProgress>(`/api/body-metrics/progress?period=${period}`)
    return response.data
  },

  // Get body metrics history for a date range
  async getBodyMetricsHistory(startDate: string, endDate: string, limit = 100, offset = 0): Promise<PaginatedResponse<BodyMetrics>> {
    return this.getBodyMetrics({ startDate, endDate, limit, offset })
  },

  // Get BMI calculation for a specific measurement
  async calculateBMI(weightKg: number, heightCm: number): Promise<BMICalculationResult> {
    const response = await apiClient.post<BMICalculationResult>('/api/body-metrics/calculate-bmi', {
      weightKg,
      heightCm,
    })
    return response.data
  },

  // Get body composition analysis
  async getBodyCompositionAnalysis(metricsId: string): Promise<BodyCompositionAnalysisResult> {
    const response = await apiClient.get<BodyCompositionAnalysisResult>(`/api/body-metrics/${metricsId}/analysis`)
    return response.data
  },

  // Get weekly body metrics summary
  async getWeeklyBodyMetricsSummary(startDate: string): Promise<WeeklyBodyMetricsSummary> {
    const response = await apiClient.get<WeeklyBodyMetricsSummary>(`/api/body-metrics/weekly-summary?startDate=${startDate}`)
    return response.data
  },

  // Get body metrics trends analysis
  async getBodyMetricsTrends(metric: 'weight' | 'bodyFat' | 'muscleMass' | 'visceralFat', period: '30d' | '90d' | '1y' = '30d'): Promise<BodyMetricsTrends> {
    const response = await apiClient.get<BodyMetricsTrends>(`/api/body-metrics/trends?metric=${metric}&period=${period}`)
    return response.data
  },

  // Export body metrics data
  async exportBodyMetrics(startDate: string, endDate: string, format: 'csv' | 'json' = 'json'): Promise<BodyMetricsExportResponse> {
    const response = await apiClient.get<BodyMetricsExportResponse>(`/api/body-metrics/export?startDate=${startDate}&endDate=${endDate}&format=${format}`)
    return response.data
  },

  // Bulk import body metrics
  async bulkImportBodyMetrics(metrics: CreateBodyMetricsRequest[]): Promise<BulkImportBodyMetricsResponse> {
    const response = await apiClient.post<BulkImportBodyMetricsResponse>('/api/body-metrics/bulk-import', { metrics })
    return response.data
  },

  // Get ideal weight recommendations
  async getIdealWeightRecommendations(heightCm: number, age: number, gender: 'male' | 'female' | 'other', activityLevel: string): Promise<IdealWeightRecommendations> {
    const response = await apiClient.post<IdealWeightRecommendations>('/api/body-metrics/ideal-weight', {
      heightCm,
      age,
      gender,
      activityLevel,
    })
    return response.data
  },
}
