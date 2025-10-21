// Exercises MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockExercises, mockExerciseTemplates } from '../../mockData'
import type { ExerciseLog, ExerciseTemplate } from '../../../types'

// Mock exercises database
const mockExerciseLogsDatabase = new Map<string, ExerciseLog>()
const mockExerciseTemplatesDatabase = new Map<string, ExerciseTemplate>()

// Helper to extract user ID from auth token
const getUserIdFromToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return null
  }
  return '1'
}

// Helper to convert simplified exercise to full exercise log
const convertToFullExerciseLog = (simplifiedExercise: any, userId: string): ExerciseLog => {
  return {
    id: simplifiedExercise.id,
    userId,
    templateId: null,
    templateName: simplifiedExercise.name,
    durationMin: simplifiedExercise.durationMin,
    caloriesBurned: simplifiedExercise.caloriesBurned,
    intensityLevel: simplifiedExercise.intensityLevel,
    performedAt: new Date(simplifiedExercise.date + 'T12:00:00Z'),
    notes: simplifiedExercise.notes || '',
    createdAt: new Date(),
  }
}

// Initialize with default data
mockExercises.forEach(exercise => {
  const fullExercise = convertToFullExerciseLog(exercise, '1')
  mockExerciseLogsDatabase.set(exercise.id, fullExercise)
})

mockExerciseTemplates.forEach(template => {
  mockExerciseTemplatesDatabase.set(template.id, template)
})

export const exercisesHandlers = [
  // GET /api/exercises/log
  http.get('/api/exercises/log', async ({ request }) => {
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
    const date = url.searchParams.get('date')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let exercises = Array.from(mockExerciseLogsDatabase.values()).filter(exercise => exercise.userId === userId)

    // Filter by date or date range
    if (date) {
      const targetDate = new Date(date)
      exercises = exercises.filter(exercise => {
        const exerciseDate = new Date(exercise.performedAt)
        return exerciseDate.toDateString() === targetDate.toDateString()
      })
    } else if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      exercises = exercises.filter(exercise => {
        const exerciseDate = new Date(exercise.performedAt)
        return exerciseDate >= start && exerciseDate <= end
      })
    }

    // Sort by performed date (newest first)
    exercises.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())

    // Apply pagination
    const total = exercises.length
    const paginatedExercises = exercises.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedExercises,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  }),

  // POST /api/exercises/log
  http.post('/api/exercises/log', async ({ request }) => {
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

    const body = await request.json() as Omit<ExerciseLog, 'id' | 'userId' | 'createdAt'>

    // Validate required fields
    const errors: Array<{ field: string; issue: string }> = []
    if (!body.templateName || body.templateName.trim().length < 2) {
      errors.push({ field: 'templateName', issue: 'Exercise name is required and must be at least 2 characters' })
    }
    if (!body.durationMin || body.durationMin <= 0) {
      errors.push({ field: 'durationMin', issue: 'Duration must be greater than 0' })
    }
    if (body.caloriesBurned !== undefined && body.caloriesBurned < 0) {
      errors.push({ field: 'caloriesBurned', issue: 'Calories burned cannot be negative' })
    }
    if (!body.intensityLevel) {
      errors.push({ field: 'intensityLevel', issue: 'Intensity level is required' })
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

    const newExercise: ExerciseLog = {
      id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...body,
      templateName: body.templateName.trim(),
      performedAt: body.performedAt || new Date(),
      createdAt: new Date(),
    }

    mockExerciseLogsDatabase.set(newExercise.id, newExercise)

    return HttpResponse.json(newExercise, { status: 201 })
  }),

  // PUT /api/exercises/log/:id
  http.put('/api/exercises/log/:id', async ({ request, params }) => {
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

    const exerciseId = params.id as string
    const body = await request.json() as Partial<ExerciseLog>

    const currentExercise = mockExerciseLogsDatabase.get(exerciseId)
    if (!currentExercise || currentExercise.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'EXERCISE_NOT_FOUND',
            message: 'Exercise log not found',
          },
        },
        { status: 404 }
      )
    }

    const updatedExercise: ExerciseLog = {
      ...currentExercise,
      ...body,
      id: exerciseId, // Ensure ID is not overwritten
      userId, // Ensure userId is not overwritten
    }

    mockExerciseLogsDatabase.set(exerciseId, updatedExercise)

    return HttpResponse.json(updatedExercise)
  }),

  // DELETE /api/exercises/log/:id
  http.delete('/api/exercises/log/:id', async ({ request, params }) => {
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

    const exerciseId = params.id as string
    const exercise = mockExerciseLogsDatabase.get(exerciseId)

    if (!exercise || exercise.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'EXERCISE_NOT_FOUND',
            message: 'Exercise log not found',
          },
        },
        { status: 404 }
      )
    }

    mockExerciseLogsDatabase.delete(exerciseId)

    return HttpResponse.json({ success: true })
  }),

  // GET /api/exercises/search
  http.get('/api/exercises/search', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const category = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    if (!query || query.trim().length < 2) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Search query must be at least 2 characters long',
            details: [
              { field: 'q', issue: 'Query is required and must be at least 2 characters' },
            ],
          },
        },
        { status: 400 }
      )
    }

    let results = Array.from(mockExerciseTemplatesDatabase.values())

    // Filter by query
    const normalizedQuery = query.trim().toLowerCase()
    results = results.filter(exercise => 
      exercise.name.toLowerCase().includes(normalizedQuery) ||
      exercise.category.toLowerCase().includes(normalizedQuery)
    )

    // Filter by category if specified
    if (category) {
      results = results.filter(exercise => exercise.category === category)
    }

    // Apply pagination
    const total = results.length
    const paginatedResults = results.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedResults,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  }),

  // GET /api/exercises/templates
  http.get('/api/exercises/templates', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let templates = Array.from(mockExerciseTemplatesDatabase.values())

    // Filter by category if specified
    if (category) {
      templates = templates.filter(template => template.category === category)
    }

    // Sort by name
    templates.sort((a, b) => a.name.localeCompare(b.name))

    // Apply pagination
    const total = templates.length
    const paginatedTemplates = templates.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedTemplates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  }),

  // GET /api/exercises/categories
  http.get('/api/exercises/categories', async () => {
    await delay(MOCK_DELAY.fast)

    const categories = Array.from(new Set(
      Array.from(mockExerciseTemplatesDatabase.values())
        .map(template => template.category)
    )).sort()

    return HttpResponse.json(categories)
  }),

  // GET /api/exercises/stats
  http.get('/api/exercises/stats', async ({ request }) => {
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

    const exercises = Array.from(mockExerciseLogsDatabase.values())
      .filter(exercise => {
        const exerciseDate = new Date(exercise.performedAt)
        return exercise.userId === userId && exerciseDate >= start && exerciseDate <= end
      })

    const stats = {
      totalExercises: exercises.length,
      totalDurationMin: exercises.reduce((sum, ex) => sum + ex.durationMin, 0),
      totalCaloriesBurned: exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0),
      averageDurationMin: exercises.length > 0 ? Math.round(exercises.reduce((sum, ex) => sum + ex.durationMin, 0) / exercises.length) : 0,
      averageCaloriesPerSession: exercises.length > 0 ? Math.round(exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0) / exercises.length) : 0,
      exercisesByCategory: exercises.reduce((acc, ex) => {
        // Map exercise names to categories (simplified for mock)
        const category = ex.templateName.includes('ランニング') || ex.templateName.includes('ウォーキング') || ex.templateName.includes('サイクリング') || ex.templateName.includes('スイミング') 
          ? 'cardio' 
          : ex.templateName.includes('ウェイト') || ex.templateName.includes('スクワット')
          ? 'strength'
          : ex.templateName.includes('ヨガ') || ex.templateName.includes('ピラティス')
          ? 'mobility'
          : 'other'
        
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      exercisesByIntensity: exercises.reduce((acc, ex) => {
        acc[ex.intensityLevel] = (acc[ex.intensityLevel] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return HttpResponse.json(stats)
  }),

  // POST /api/exercises/calculate-calories
  http.post('/api/exercises/calculate-calories', async ({ request }) => {
    await delay(MOCK_DELAY.fast)

    const body = await request.json() as {
      templateId?: string
      templateName?: string
      durationMin: number
      weightKg?: number
      intensityLevel?: string
    }

    if (!body.durationMin || body.durationMin <= 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Duration must be greater than 0',
            details: [
              { field: 'durationMin', issue: 'Duration must be greater than 0' },
            ],
          },
        },
        { status: 400 }
      )
    }

    // Get MET value from template or estimate
    let metValue = 4.0 // Default MET value
    if (body.templateId) {
      const template = mockExerciseTemplatesDatabase.get(body.templateId)
      if (template) {
        metValue = template.metValue
      }
    } else if (body.templateName) {
      // Simple estimation based on exercise name (for mock)
      const name = body.templateName.toLowerCase()
      if (name.includes('ランニング')) metValue = 7.0
      else if (name.includes('ウォーキング')) metValue = 3.5
      else if (name.includes('サイクリング')) metValue = 6.0
      else if (name.includes('スイミング')) metValue = 8.0
      else if (name.includes('ウェイト')) metValue = 6.0
      else if (name.includes('ヨガ')) metValue = 2.5
    }

    // Adjust for intensity level
    if (body.intensityLevel) {
      switch (body.intensityLevel) {
        case 'low':
          metValue *= 0.8
          break
        case 'high':
          metValue *= 1.2
          break
        // 'medium' stays as is
      }
    }

    // Calculate calories: MET × weight(kg) × duration(hours)
    const weightKg = body.weightKg || 65 // Default weight
    const durationHours = body.durationMin / 60
    const estimatedCalories = Math.round(metValue * weightKg * durationHours)

    return HttpResponse.json({
      estimatedCalories,
      metValue,
      durationMin: body.durationMin,
      weightKg,
    })
  }),
]