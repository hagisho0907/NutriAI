// Authentication MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockUser } from '../../mockData'
import type { AuthTokens, GuestLoginResponse } from '../../../types/api'
import type { UserWithProfile } from '../../../types/user'

// Mock authentication tokens
const generateMockTokens = (): AuthTokens => ({
  accessToken: `mock-access-token-${Date.now()}`,
  refreshToken: `mock-refresh-token-${Date.now()}`,
  expiresIn: 3600, // 1 hour
})

// Mock user database (in real app, this would be a database)
const mockUserDatabase = new Map<string, UserWithProfile>()

// Helper to validate credentials
const validateCredentials = (email: string, password: string): boolean => {
  // In mock environment, accept any email/password combination
  // For demo purposes, reject passwords shorter than 6 characters
  return email.includes('@') && password.length >= 6
}

// Helper to generate user ID
const generateUserId = (): string => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const authHandlers = [
  // POST /auth/login
  http.post('/auth/login', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const body = await request.json() as { email: string; password: string }
    
    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
            details: [
              { field: 'email', issue: body.email ? '' : 'Email is required' },
              { field: 'password', issue: body.password ? '' : 'Password is required' },
            ].filter(detail => detail.issue),
          },
        },
        { status: 400 }
      )
    }

    if (!validateCredentials(body.email, body.password)) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      )
    }

    // Check if user exists or create new one
    let user = Array.from(mockUserDatabase.values()).find(u => u.email === body.email)
    if (!user) {
      user = {
        id: generateUserId(),
        email: body.email,
        loginProvider: 'email',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          userId: generateUserId(),
          displayName: body.email.split('@')[0],
          gender: mockUser.gender,
          birthDate: mockUser.birthDate,
          heightCm: mockUser.heightCm,
          activityLevel: mockUser.activityLevel,
          bodyFatPct: mockUser.bodyFatPct,
        },
      }
      mockUserDatabase.set(user.id, user)
    }

    const tokens = generateMockTokens()

    const response: GuestLoginResponse = {
      user: {
        id: user.id,
        email: user.email,
      },
      tokens,
    }

    return HttpResponse.json(response)
  }),

  // POST /auth/register
  http.post('/auth/register', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const body = await request.json() as { 
      email: string
      password: string
      displayName?: string
    }
    
    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
            details: [
              { field: 'email', issue: body.email ? '' : 'Email is required' },
              { field: 'password', issue: body.password ? '' : 'Password is required' },
            ].filter(detail => detail.issue),
          },
        },
        { status: 400 }
      )
    }

    if (!validateCredentials(body.email, body.password)) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format or password too short',
            details: [
              { field: 'email', issue: !body.email.includes('@') ? 'Invalid email format' : '' },
              { field: 'password', issue: body.password.length < 6 ? 'Password must be at least 6 characters' : '' },
            ].filter(detail => detail.issue),
          },
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = Array.from(mockUserDatabase.values()).find(u => u.email === body.email)
    if (existingUser) {
      return HttpResponse.json(
        {
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists',
          },
        },
        { status: 409 }
      )
    }

    // Create new user
    const newUser: UserWithProfile = {
      id: generateUserId(),
      email: body.email,
      loginProvider: 'email',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        userId: generateUserId(),
        displayName: body.displayName || body.email.split('@')[0],
        activityLevel: 'moderate',
      },
    }

    mockUserDatabase.set(newUser.id, newUser)

    const tokens = generateMockTokens()

    const response: GuestLoginResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
      },
      tokens,
    }

    return HttpResponse.json(response)
  }),

  // POST /auth/refresh
  http.post('/auth/refresh', async ({ request }) => {
    await delay(MOCK_DELAY.fast)

    const body = await request.json() as { refreshToken: string }
    
    if (!body.refreshToken || !body.refreshToken.startsWith('mock-refresh-token')) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid refresh token',
          },
        },
        { status: 401 }
      )
    }

    const tokens = generateMockTokens()
    
    return HttpResponse.json(tokens)
  }),

  // POST /auth/logout
  http.post('/auth/logout', async () => {
    await delay(MOCK_DELAY.fast)
    
    return HttpResponse.json({ success: true })
  }),

  // GET /auth/me
  http.get('/auth/me', async ({ request }) => {
    await delay(MOCK_DELAY.fast)

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

    // Return first user from database as current user (in real app, this would be based on token)
    const user = Array.from(mockUserDatabase.values())[0] || {
      id: generateUserId(),
      email: 'guest@nutriai.dev',
      loginProvider: 'email',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        userId: generateUserId(),
        displayName: 'Guest User',
        gender: mockUser.gender,
        birthDate: mockUser.birthDate,
        heightCm: mockUser.heightCm,
        activityLevel: mockUser.activityLevel,
        bodyFatPct: mockUser.bodyFatPct,
      },
    }

    return HttpResponse.json(user)
  }),

  // POST /auth/guest-login
  http.post('/auth/guest-login', async () => {
    await delay(MOCK_DELAY.medium)

    const guestUser: UserWithProfile = {
      id: generateUserId(),
      email: 'guest@nutriai.dev',
      loginProvider: 'guest',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        userId: generateUserId(),
        displayName: 'ゲストユーザー',
        gender: mockUser.gender,
        birthDate: mockUser.birthDate,
        heightCm: mockUser.heightCm,
        activityLevel: mockUser.activityLevel,
        bodyFatPct: mockUser.bodyFatPct,
      },
    }

    mockUserDatabase.set(guestUser.id, guestUser)

    const tokens = generateMockTokens()

    const response: GuestLoginResponse = {
      user: {
        id: guestUser.id,
        email: guestUser.email,
      },
      tokens,
    }

    return HttpResponse.json(response)
  }),
]
