// Body Metrics MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockBodyMetrics } from '../../mockData'
import type { BodyMetrics } from '../../../types'

// Mock body metrics database
const mockBodyMetricsDatabase = new Map<string, BodyMetrics>()

// Helper to extract user ID from auth token
const getUserIdFromToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return null
  }
  return '1'
}

// Helper to convert simplified body metric to full body metric
const convertToFullBodyMetric = (simplifiedMetric: any, userId: string): BodyMetrics => {
  return {
    id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    recordedOn: typeof simplifiedMetric.date === 'string' ? simplifiedMetric.date : new Date(simplifiedMetric.date).toISOString(),
    measurementDate: new Date(simplifiedMetric.date),
    weightKg: simplifiedMetric.weightKg,
    bodyFatPct: simplifiedMetric.bodyFatPct,
    skeletalMuscleKg: simplifiedMetric.muscleMassKg,
    visceralFatLevel: simplifiedMetric.visceralFatLevel,
    basalMetabolicRate: simplifiedMetric.bmr,
    notes: simplifiedMetric.notes || '',
    source: 'manual',
    createdAt: new Date().toISOString(),
  }
}

// Initialize with default data
mockBodyMetrics.forEach((metric, index) => {
  const fullMetric = convertToFullBodyMetric({
    ...metric,
    muscleMassKg: 45 + Math.random() * 5, // Random muscle mass
    visceralFatLevel: 5 + Math.random() * 3, // Random visceral fat level
    bmr: 1200 + Math.random() * 200, // Random BMR
  }, '1')
  fullMetric.id = `metric_${index + 1}`
  mockBodyMetricsDatabase.set(fullMetric.id, fullMetric)
})

export const bodyMetricsHandlers = [
  // GET /api/body-metrics
  http.get('/api/body-metrics', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let metrics = Array.from(mockBodyMetricsDatabase.values()).filter(metric => metric.userId === userId)

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      metrics = metrics.filter(metric => {
      const metricDate = new Date(metric.measurementDate ?? metric.recordedOn)
        return metricDate >= start && metricDate <= end
      })
    }

    // Sort by measurement date (newest first)
    metrics.sort(
      (a, b) =>
        new Date(b.measurementDate ?? b.recordedOn).getTime() -
        new Date(a.measurementDate ?? a.recordedOn).getTime(),
    )

    // Apply pagination
    const total = metrics.length
    const paginatedMetrics = metrics.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedMetrics,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  }),

  // POST /api/body-metrics
  http.post('/api/body-metrics', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json() as Omit<BodyMetrics, 'id' | 'userId' | 'createdAt'>

    // Validate required fields
    const errors: Array<{ field: string; issue: string }> = []
    if (!body.weightKg || body.weightKg <= 0 || body.weightKg > 500) {
      errors.push({ field: 'weightKg', issue: 'Weight must be between 0 and 500 kg' })
    }
    if (body.bodyFatPct !== undefined && (body.bodyFatPct < 0 || body.bodyFatPct > 60)) {
      errors.push({ field: 'bodyFatPct', issue: 'Body fat percentage must be between 0 and 60%' })
    }
    if (body.muscleMassKg !== undefined && (body.muscleMassKg < 0 || body.muscleMassKg > 200)) {
      errors.push({ field: 'muscleMassKg', issue: 'Muscle mass must be between 0 and 200 kg' })
    }
    if (body.visceralFatLevel !== undefined && (body.visceralFatLevel < 1 || body.visceralFatLevel > 30)) {
      errors.push({ field: 'visceralFatLevel', issue: 'Visceral fat level must be between 1 and 30' })
    }
    if (body.bmr !== undefined && (body.bmr < 800 || body.bmr > 4000)) {
      errors.push({ field: 'bmr', issue: 'BMR must be between 800 and 4000 calories' })
    }

    if (errors.length > 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors,
          },
        },
        { status: 400 }
      )
    }

    // Check if a measurement already exists for this date
    const measurementDate = new Date(body.measurementDate ?? body.recordedOn)
    const existingMetric = Array.from(mockBodyMetricsDatabase.values()).find(metric => {
      const metricDate = new Date(metric.measurementDate ?? metric.recordedOn)
      return metric.userId === userId && 
             metricDate.toDateString() === measurementDate.toDateString()
    })

    if (existingMetric) {
      return HttpResponse.json(
        {
          error: {
            code: 'DUPLICATE_MEASUREMENT',
            message: 'A measurement already exists for this date. Please update the existing measurement.',
          },
        },
        { status: 409 }
      )
    }

    const recordedOn = body.recordedOn ?? (body.measurementDate ? new Date(body.measurementDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const measurementDateValue = new Date(body.measurementDate ?? recordedOn)

    const newMetric: BodyMetrics = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...body,
      recordedOn,
      measurementDate: measurementDateValue,
      createdAt: new Date().toISOString(),
    }

    mockBodyMetricsDatabase.set(newMetric.id, newMetric)

    return HttpResponse.json(newMetric, { status: 201 })
  }),

  // PUT /api/body-metrics/:id
  http.put('/api/body-metrics/:id', async ({ request, params }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const metricId = params.id as string
    const body = await request.json() as Partial<BodyMetrics>

    const currentMetric = mockBodyMetricsDatabase.get(metricId)
    if (!currentMetric || currentMetric.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'METRIC_NOT_FOUND',
            message: 'Body metric not found',
          },
        },
        { status: 404 }
      )
    }

    // Validate updated fields
    const errors: Array<{ field: string; issue: string }> = []
    if (body.weightKg !== undefined && (body.weightKg <= 0 || body.weightKg > 500)) {
      errors.push({ field: 'weightKg', issue: 'Weight must be between 0 and 500 kg' })
    }
    if (body.bodyFatPct !== undefined && (body.bodyFatPct < 0 || body.bodyFatPct > 60)) {
      errors.push({ field: 'bodyFatPct', issue: 'Body fat percentage must be between 0 and 60%' })
    }

    if (errors.length > 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors,
          },
        },
        { status: 400 }
      )
    }

    const updatedMetric: BodyMetrics = {
      ...currentMetric,
      ...body,
      id: metricId, // Ensure ID is not overwritten
      userId, // Ensure userId is not overwritten
    }

    mockBodyMetricsDatabase.set(metricId, updatedMetric)

    return HttpResponse.json(updatedMetric)
  }),

  // DELETE /api/body-metrics/:id
  http.delete('/api/body-metrics/:id', async ({ request, params }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const metricId = params.id as string
    const metric = mockBodyMetricsDatabase.get(metricId)

    if (!metric || metric.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'METRIC_NOT_FOUND',
            message: 'Body metric not found',
          },
        },
        { status: 404 }
      )
    }

    mockBodyMetricsDatabase.delete(metricId)

    return HttpResponse.json({ success: true })
  }),

  // GET /api/body-metrics/latest
  http.get('/api/body-metrics/latest', async ({ request }) => {
    await delay(MOCK_DELAY.fast)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const metrics = Array.from(mockBodyMetricsDatabase.values())
      .filter(metric => metric.userId === userId)
      .sort((a, b) => new Date(b.measurementDate ?? b.recordedOn).getTime() - new Date(a.measurementDate ?? a.recordedOn).getTime())

    const latestMetric = metrics[0] || null

    return HttpResponse.json(latestMetric)
  }),

  // GET /api/body-metrics/stats
  http.get('/api/body-metrics/stats', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    if (!startDate || !endDate) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Start date and end date are required',
            details: [
              { field: 'startDate', issue: !startDate ? 'Start date is required' : '' },
              { field: 'endDate', issue: !endDate ? 'End date is required' : '' },
            ].filter(detail => detail.issue),
          },
        },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const metrics = Array.from(mockBodyMetricsDatabase.values())
      .filter(metric => {
        const metricDate = new Date(metric.measurementDate ?? metric.recordedOn)
        return metric.userId === userId && metricDate >= start && metricDate <= end
      })
      .sort((a, b) => new Date(a.measurementDate ?? a.recordedOn).getTime() - new Date(b.measurementDate ?? b.recordedOn).getTime())

    if (metrics.length === 0) {
      return HttpResponse.json({
        totalMeasurements: 0,
        weightChange: null,
        bodyFatChange: null,
        trends: {
          weight: 'stable',
          bodyFat: 'stable',
        },
        averages: null,
      })
    }

    const firstMetric = metrics[0]
    const lastMetric = metrics[metrics.length - 1]

    const weightChange = lastMetric.weightKg - firstMetric.weightKg
    const bodyFatChange = (lastMetric.bodyFatPct || 0) - (firstMetric.bodyFatPct || 0)

    const averageWeight = metrics.reduce((sum, m) => sum + m.weightKg, 0) / metrics.length
    const averageBodyFat = metrics.filter(m => m.bodyFatPct !== undefined).length > 0
      ? metrics.filter(m => m.bodyFatPct !== undefined).reduce((sum, m) => sum + (m.bodyFatPct || 0), 0) / 
        metrics.filter(m => m.bodyFatPct !== undefined).length
      : null

    // Determine trends (simplified)
    const weightTrend = weightChange > 0.5 ? 'increasing' : weightChange < -0.5 ? 'decreasing' : 'stable'
    const bodyFatTrend = bodyFatChange > 0.5 ? 'increasing' : bodyFatChange < -0.5 ? 'decreasing' : 'stable'

    const stats = {
      totalMeasurements: metrics.length,
      weightChange: {
        absolute: Math.round(weightChange * 10) / 10,
        percentage: Math.round((weightChange / firstMetric.weightKg) * 1000) / 10,
      },
      bodyFatChange: firstMetric.bodyFatPct && lastMetric.bodyFatPct ? {
        absolute: Math.round(bodyFatChange * 10) / 10,
        percentage: Math.round((bodyFatChange / firstMetric.bodyFatPct) * 1000) / 10,
      } : null,
      trends: {
        weight: weightTrend,
        bodyFat: bodyFatTrend,
      },
      averages: {
        weight: Math.round(averageWeight * 10) / 10,
        bodyFat: averageBodyFat ? Math.round(averageBodyFat * 10) / 10 : null,
      },
    }

    return HttpResponse.json(stats)
  }),

  // GET /api/body-metrics/progress
  http.get('/api/body-metrics/progress', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    const metrics = Array.from(mockBodyMetricsDatabase.values())
      .filter(metric => {
        const metricDate = new Date(metric.measurementDate ?? metric.recordedOn)
        return metric.userId === userId && metricDate >= startDate && metricDate <= endDate
      })
      .sort((a, b) => new Date(a.measurementDate ?? a.recordedOn).getTime() - new Date(b.measurementDate ?? b.recordedOn).getTime())

    const progress = {
      period,
      dataPoints: metrics.map(metric => ({
        date: new Date(metric.measurementDate ?? metric.recordedOn).toISOString().split('T')[0],
        weight: metric.weightKg,
        bodyFat: metric.bodyFatPct,
        muscleMass: metric.muscleMassKg,
        visceralFat: metric.visceralFatLevel,
        bmr: metric.bmr,
      })),
      summary: {
        totalMeasurements: metrics.length,
        firstMeasurement: metrics[0] ? {
          date: new Date(metrics[0].measurementDate ?? metrics[0].recordedOn).toISOString().split('T')[0],
          weight: metrics[0].weightKg,
          bodyFat: metrics[0].bodyFatPct,
        } : null,
        lastMeasurement: metrics[metrics.length - 1] ? {
          date: new Date(metrics[metrics.length - 1].measurementDate ?? metrics[metrics.length - 1].recordedOn).toISOString().split('T')[0],
          weight: metrics[metrics.length - 1].weightKg,
          bodyFat: metrics[metrics.length - 1].bodyFatPct,
        } : null,
      },
    }

    return HttpResponse.json(progress)
  }),
]
