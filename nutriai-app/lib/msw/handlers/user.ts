// User profile MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockUser, mockGoal } from '../../mockData'
import type { UserProfile, UserGoal } from '../../../types'

// Mock user profiles database
const mockProfilesDatabase = new Map<string, UserProfile>()
const mockGoalsDatabase = new Map<string, UserGoal>()

// Initialize with default data
const defaultProfile: UserProfile = {
  userId: '1',
  displayName: mockUser.displayName,
  gender: mockUser.gender,
  birthDate: mockUser.birthDate,
  heightCm: mockUser.heightCm,
  activityLevel: mockUser.activityLevel,
  bodyFatPct: mockUser.bodyFatPct,
}

const defaultGoal: UserGoal = {
  ...mockGoal,
  userId: '1',
}

mockProfilesDatabase.set('1', defaultProfile)
mockGoalsDatabase.set('1', defaultGoal)

// Helper to extract user ID from auth token
const getUserIdFromToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return null
  }
  // In real app, decode JWT token. For mock, return default user ID
  return '1'
}

export const userHandlers = [
  // GET /api/user/profile
  http.get('/api/user/profile', async ({ request }) => {
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

    const profile = mockProfilesDatabase.get(userId)
    if (!profile) {
      return HttpResponse.json(
        {
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'User profile not found',
          },
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(profile)
  }),

  // PUT /api/user/profile
  http.put('/api/user/profile', async ({ request }) => {
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

    const body = await request.json() as Partial<UserProfile>
    const currentProfile = mockProfilesDatabase.get(userId)

    if (!currentProfile) {
      return HttpResponse.json(
        {
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'User profile not found',
          },
        },
        { status: 404 }
      )
    }

    // Validate required fields
    const errors: Array<{ field: string; issue: string }> = []
    if (body.heightCm !== undefined && (body.heightCm < 100 || body.heightCm > 250)) {
      errors.push({ field: 'heightCm', issue: 'Height must be between 100 and 250 cm' })
    }
    if (body.bodyFatPct !== undefined && (body.bodyFatPct < 5 || body.bodyFatPct > 60)) {
      errors.push({ field: 'bodyFatPct', issue: 'Body fat percentage must be between 5 and 60%' })
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

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...body,
      userId, // Ensure userId is not overwritten
    }

    mockProfilesDatabase.set(userId, updatedProfile)

    return HttpResponse.json(updatedProfile)
  }),

  // GET /api/user/goals
  http.get('/api/user/goals', async ({ request }) => {
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

    const goals = Array.from(mockGoalsDatabase.values()).filter(goal => goal.userId === userId)
    
    return HttpResponse.json(goals)
  }),

  // POST /api/user/goals
  http.post('/api/user/goals', async ({ request }) => {
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

    const body = await request.json() as Omit<UserGoal, 'id' | 'userId' | 'status'>

    // Validate required fields
    const errors: Array<{ field: string; issue: string }> = []
    if (!body.goalType) {
      errors.push({ field: 'goalType', issue: 'Goal type is required' })
    }
    if (!body.targetWeightKg || body.targetWeightKg < 30 || body.targetWeightKg > 300) {
      errors.push({ field: 'targetWeightKg', issue: 'Target weight must be between 30 and 300 kg' })
    }
    if (!body.targetCalorieIntake || body.targetCalorieIntake < 1000 || body.targetCalorieIntake > 5000) {
      errors.push({ field: 'targetCalorieIntake', issue: 'Target calorie intake must be between 1000 and 5000' })
    }
    if (!body.targetDurationWeeks || body.targetDurationWeeks < 1 || body.targetDurationWeeks > 104) {
      errors.push({ field: 'targetDurationWeeks', issue: 'Target duration must be between 1 and 104 weeks' })
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

    // Deactivate existing goals
    for (const [id, goal] of mockGoalsDatabase.entries()) {
      if (goal.userId === userId && goal.status === 'active') {
        mockGoalsDatabase.set(id, { ...goal, status: 'completed' })
      }
    }

    const newGoal: UserGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...body,
      status: 'active',
    }

    mockGoalsDatabase.set(newGoal.id, newGoal)

    return HttpResponse.json(newGoal, { status: 201 })
  }),

  // PUT /api/user/goals/:id
  http.put('/api/user/goals/:id', async ({ request, params }) => {
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

    const goalId = params.id as string
    const body = await request.json() as Partial<UserGoal>

    const currentGoal = mockGoalsDatabase.get(goalId)
    if (!currentGoal || currentGoal.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'GOAL_NOT_FOUND',
            message: 'Goal not found',
          },
        },
        { status: 404 }
      )
    }

    const updatedGoal: UserGoal = {
      ...currentGoal,
      ...body,
      id: goalId, // Ensure ID is not overwritten
      userId, // Ensure userId is not overwritten
    }

    mockGoalsDatabase.set(goalId, updatedGoal)

    return HttpResponse.json(updatedGoal)
  }),

  // DELETE /api/user/goals/:id
  http.delete('/api/user/goals/:id', async ({ request, params }) => {
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

    const goalId = params.id as string
    const goal = mockGoalsDatabase.get(goalId)

    if (!goal || goal.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'GOAL_NOT_FOUND',
            message: 'Goal not found',
          },
        },
        { status: 404 }
      )
    }

    mockGoalsDatabase.delete(goalId)

    return HttpResponse.json({ success: true })
  }),

  // GET /api/user/preferences
  http.get('/api/user/preferences', async ({ request }) => {
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

    // Mock user preferences
    const preferences = {
      units: {
        weight: 'kg',
        height: 'cm',
        distance: 'km',
        temperature: 'celsius',
      },
      notifications: {
        mealReminders: true,
        exerciseReminders: true,
        goalProgress: true,
        weeklyReports: true,
      },
      privacy: {
        publicProfile: false,
        shareProgress: false,
        analyticsConsent: true,
      },
      dietary: {
        restrictions: [],
        allergies: [],
        preferences: [],
      },
    }

    return HttpResponse.json(preferences)
  }),

  // PUT /api/user/preferences
  http.put('/api/user/preferences', async ({ request }) => {
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

    const body = await request.json()

    // In a real app, you'd validate and save the preferences
    return HttpResponse.json(body)
  }),
]