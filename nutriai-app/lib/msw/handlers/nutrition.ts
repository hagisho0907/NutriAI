// Nutrition MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockDailySummary } from '../../mockData'
import type { NutritionGoals, DailyNutrition, NutrientBalance } from '../../../types'

// Mock nutrition database
const mockNutritionGoalsDatabase = new Map<string, NutritionGoals>()
const mockDailyNutritionDatabase = new Map<string, DailyNutrition>()

// Helper to extract user ID from auth token
const getUserIdFromToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return null
  }
  return '1'
}

// Helper to generate nutrition data for date ranges
const generateDailyNutrition = (userId: string, date: string): DailyNutrition => {
  const baseCalories = 1800 + Math.random() * 400 - 200 // 1600-2000
  const baseProtein = 120 + Math.random() * 40 - 20 // 100-140
  const baseFat = 60 + Math.random() * 20 - 10 // 50-70
  const baseCarbs = 200 + Math.random() * 50 - 25 // 175-225

  return {
    id: `daily-${userId}-${date}`,
    userId,
    date: new Date(date),
    totalNutrients: {
      calories: Math.round(baseCalories),
      protein: Math.round(baseProtein),
      carbs: Math.round(baseCarbs),
      fat: Math.round(baseFat),
      fiber: Math.round(25 + Math.random() * 10),
      sugar: Math.round(50 + Math.random() * 30),
      sodium: Math.round(2000 + Math.random() * 500),
      saturatedFat: Math.round(15 + Math.random() * 10),
      cholesterol: Math.round(200 + Math.random() * 100),
    },
    meals: [],
    waterIntake: Math.round(2000 + Math.random() * 1000),
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Initialize with default data
const defaultGoals: NutritionGoals = {
  id: 'goals-1',
  userId: '1',
  dailyTargets: {
    calories: mockDailySummary.targetCalories,
    protein: mockDailySummary.targetProteinG,
    fat: mockDailySummary.targetFatG,
    carbs: mockDailySummary.targetCarbG,
    fiber: 25,
    sugar: 50,
    sodium: 2300,
    saturatedFat: 20,
    cholesterol: 300,
  },
  macroRatios: {
    protein: 30, // 30% of calories from protein
    fat: 30,     // 30% of calories from fat
    carbs: 40,   // 40% of calories from carbs
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

mockNutritionGoalsDatabase.set('1', defaultGoals)

export const nutritionHandlers = [
  // GET /api/nutrition/goals
  http.get('/api/nutrition/goals', async ({ request }) => {
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

    const goals = mockNutritionGoalsDatabase.get(userId)
    if (!goals) {
      return HttpResponse.json(
        {
          error: {
            code: 'GOALS_NOT_FOUND',
            message: 'Nutrition goals not found',
          },
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(goals)
  }),

  // PUT /api/nutrition/goals
  http.put('/api/nutrition/goals', async ({ request }) => {
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

    const body = await request.json() as Partial<NutritionGoals>

    // Validate macro ratios add up to 100%
    if (body.macroRatios) {
      const { protein, fat, carbs } = body.macroRatios
      if (protein + fat + carbs !== 100) {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Macro ratios must add up to 100%',
              details: [
                { field: 'macroRatios', issue: `Current total: ${protein + fat + carbs}%, expected: 100%` },
              ],
            },
          },
          { status: 400 }
        )
      }
    }

    const currentGoals = mockNutritionGoalsDatabase.get(userId) || {
      ...defaultGoals,
      userId,
    }

    const updatedGoals: NutritionGoals = {
      ...currentGoals,
      ...body,
      id: currentGoals.id,
      userId,
      updatedAt: new Date(),
    }

    mockNutritionGoalsDatabase.set(userId, updatedGoals)

    return HttpResponse.json(updatedGoals)
  }),

  // GET /api/nutrition/daily
  http.get('/api/nutrition/daily', async ({ request }) => {
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
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const key = `${userId}-${date}`
    let dailyNutrition = mockDailyNutritionDatabase.get(key)

    if (!dailyNutrition) {
      dailyNutrition = generateDailyNutrition(userId, date)
      mockDailyNutritionDatabase.set(key, dailyNutrition)
    }

    return HttpResponse.json(dailyNutrition)
  }),

  // GET /api/nutrition/history
  http.get('/api/nutrition/history', async ({ request }) => {
    await delay(MOCK_DELAY.slow)

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
    const limit = parseInt(url.searchParams.get('limit') || '30')
    const offset = parseInt(url.searchParams.get('offset') || '0')

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

    // Generate nutrition data for the date range
    const history: DailyNutrition[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const current = new Date(start)

    while (current <= end) {
      const dateString = current.toISOString().split('T')[0]
      const key = `${userId}-${dateString}`
      
      let dailyNutrition = mockDailyNutritionDatabase.get(key)
      if (!dailyNutrition) {
        dailyNutrition = generateDailyNutrition(userId, dateString)
        mockDailyNutritionDatabase.set(key, dailyNutrition)
      }
      
      history.push(dailyNutrition)
      current.setDate(current.getDate() + 1)
    }

    // Apply pagination
    const paginatedHistory = history.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedHistory,
      pagination: {
        total: history.length,
        limit,
        offset,
        hasMore: offset + limit < history.length,
      },
    })
  }),

  // GET /api/nutrition/summary
  http.get('/api/nutrition/summary', async ({ request }) => {
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
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const key = `${userId}-${date}`
    let dailyNutrition = mockDailyNutritionDatabase.get(key)

    if (!dailyNutrition) {
      dailyNutrition = generateDailyNutrition(userId, date)
      mockDailyNutritionDatabase.set(key, dailyNutrition)
    }

    const goals = mockNutritionGoalsDatabase.get(userId) || defaultGoals

    // Calculate nutrient balance
    const balance: NutrientBalance = {
      calories: {
        consumed: dailyNutrition.totalNutrients.calories,
        target: goals.dailyTargets.calories,
        remaining: Math.max(0, goals.dailyTargets.calories - dailyNutrition.totalNutrients.calories),
        percentage: Math.round((dailyNutrition.totalNutrients.calories / goals.dailyTargets.calories) * 100),
      },
      protein: {
        consumed: dailyNutrition.totalNutrients.protein,
        target: goals.dailyTargets.protein,
        remaining: Math.max(0, goals.dailyTargets.protein - dailyNutrition.totalNutrients.protein),
        percentage: Math.round((dailyNutrition.totalNutrients.protein / goals.dailyTargets.protein) * 100),
      },
      fat: {
        consumed: dailyNutrition.totalNutrients.fat,
        target: goals.dailyTargets.fat,
        remaining: Math.max(0, goals.dailyTargets.fat - dailyNutrition.totalNutrients.fat),
        percentage: Math.round((dailyNutrition.totalNutrients.fat / goals.dailyTargets.fat) * 100),
      },
      carbs: {
        consumed: dailyNutrition.totalNutrients.carbs,
        target: goals.dailyTargets.carbs,
        remaining: Math.max(0, goals.dailyTargets.carbs - dailyNutrition.totalNutrients.carbs),
        percentage: Math.round((dailyNutrition.totalNutrients.carbs / goals.dailyTargets.carbs) * 100),
      },
    }

    const summary = {
      date,
      nutrition: dailyNutrition,
      goals,
      balance,
      insights: {
        topNutrients: ['protein', 'fiber'],
        recommendations: [
          'Great protein intake today!',
          'Consider adding more vegetables for fiber',
          'Water intake is on track',
        ],
      },
    }

    return HttpResponse.json(summary)
  }),

  // POST /api/nutrition/water
  http.post('/api/nutrition/water', async ({ request }) => {
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

    const body = await request.json() as { amount: number; date?: string }
    const date = body.date || new Date().toISOString().split('T')[0]
    
    if (!body.amount || body.amount <= 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Water amount must be positive',
            details: [
              { field: 'amount', issue: 'Amount must be greater than 0' },
            ],
          },
        },
        { status: 400 }
      )
    }

    const key = `${userId}-${date}`
    let dailyNutrition = mockDailyNutritionDatabase.get(key)

    if (!dailyNutrition) {
      dailyNutrition = generateDailyNutrition(userId, date)
    }

    dailyNutrition.waterIntake += body.amount
    dailyNutrition.updatedAt = new Date()

    mockDailyNutritionDatabase.set(key, dailyNutrition)

    return HttpResponse.json({
      waterIntake: dailyNutrition.waterIntake,
      date: dailyNutrition.date,
    })
  }),
]