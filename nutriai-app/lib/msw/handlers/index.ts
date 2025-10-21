// MSW handlers index - aggregates all API handlers
import { authHandlers } from './auth'
import { userHandlers } from './user'
import { nutritionHandlers } from './nutrition'
import { foodsHandlers } from './foods'
import { mealsHandlers } from './meals'
import { exercisesHandlers } from './exercises'
import { bodyMetricsHandlers } from './body-metrics'
import { chatHandlers } from './chat'
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import type { DashboardTodayResponse, AnalyticsProgressResponse, HealthCheckResponse } from '../../../types/api'

// Additional handlers for dashboard and analytics
const dashboardHandlers = [
  // GET /api/dashboard/today
  http.get('/api/dashboard/today', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
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

    const today = new Date().toISOString().split('T')[0]
    
    const response: DashboardTodayResponse = {
      date: today,
      summary: {
        calorieIntake: 1250,
        calorieBurned: 430,
        proteinG: 65,
        fatG: 32,
        carbG: 145,
        waterMl: 1800,
      },
      targets: {
        calories: 1800,
        proteinG: 120,
        fatG: 60,
        carbG: 200,
        waterMl: 2500,
      },
      tasks: [
        { type: 'log_meal', status: 'completed', title: '朝食を記録する' },
        { type: 'log_meal', status: 'completed', title: '昼食を記録する' },
        { type: 'log_meal', status: 'pending', title: '夕食を記録する' },
        { type: 'log_exercise', status: 'completed', title: '運動を記録する' },
        { type: 'log_weight', status: 'pending', title: '体重を記録する' },
      ],
      streak: {
        currentDays: 7,
        bestDays: 14,
      },
      aiAdvice: '今日は順調です！夕食でタンパク質を少し増やすとバランスが良くなります。',
    }

    return HttpResponse.json(response)
  }),

  // GET /api/analytics/progress
  http.get('/api/analytics/progress', async ({ request }) => {
    await delay(MOCK_DELAY.slow)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
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
    const period = url.searchParams.get('period') || '30d'

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
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    const response: AnalyticsProgressResponse = {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      weightProgress: {
        startWeight: 60.2,
        currentWeight: 58.7,
        targetWeight: 55.0,
        changeKg: -1.5,
        changePercent: -2.5,
      },
      nutritionAverage: {
        calories: 1780,
        proteinG: 98,
        fatG: 58,
        carbG: 195,
      },
      exerciseStats: {
        totalDurationMin: 720,
        totalCaloriesBurned: 2850,
        sessionCount: 18,
        avgDurationPerSession: 40,
      },
      adherence: {
        calorieAdherencePercent: 92,
        exerciseDaysPercent: 78,
        loggingConsistencyPercent: 94,
      },
    }

    return HttpResponse.json(response)
  }),
]

// Health check and utility handlers
const utilityHandlers = [
  // GET /api/health
  http.get('/api/health', async () => {
    await delay(MOCK_DELAY.fast)

    const response: HealthCheckResponse = {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'ok', latencyMs: 12 },
        cache: { status: 'ok', latencyMs: 3 },
        ai: { status: 'ok', latencyMs: 156 },
      },
    }

    return HttpResponse.json(response)
  }),

  // POST /api/upload
  http.post('/api/upload', async ({ request }) => {
    await delay(MOCK_DELAY.network)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
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

    // Mock file upload response
    const mockFileUrl = `https://mock-cdn.nutriai.dev/uploads/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    
    return HttpResponse.json({
      url: mockFileUrl,
      key: `uploads/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    })
  }),

  // Catch-all handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    
    return HttpResponse.json(
      {
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: `Endpoint ${request.method} ${new URL(request.url).pathname} not found`,
        },
      },
      { status: 404 }
    )
  }),
]

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...nutritionHandlers,
  ...foodsHandlers,
  ...mealsHandlers,
  ...exercisesHandlers,
  ...bodyMetricsHandlers,
  ...chatHandlers,
  ...dashboardHandlers,
  ...utilityHandlers,
]

// Export individual handler groups for testing
export {
  authHandlers,
  userHandlers,
  nutritionHandlers,
  foodsHandlers,
  mealsHandlers,
  exercisesHandlers,
  bodyMetricsHandlers,
  chatHandlers,
  dashboardHandlers,
  utilityHandlers,
}