// Foods MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockFoods, mockCustomFoods } from '../../mockData'
import type { Food, CustomFood } from '../../../types'

// Mock foods database
const mockFoodsDatabase = new Map<string, Food>()
const mockCustomFoodsDatabase = new Map<string, CustomFood>()

// Initialize with default data
mockFoods.forEach(food => mockFoodsDatabase.set(food.id, food))
mockCustomFoods.forEach(food => mockCustomFoodsDatabase.set(food.id, food))

// Helper to extract user ID from auth token
const getUserIdFromToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return null
  }
  return '1'
}

// Helper to search foods by query
const searchFoods = (query: string, limit: number = 20): Food[] => {
  const normalizedQuery = query.toLowerCase()
  return Array.from(mockFoodsDatabase.values())
    .filter(food => 
      food.name.toLowerCase().includes(normalizedQuery) ||
      (food.brand && food.brand.toLowerCase().includes(normalizedQuery)) ||
      (food.category && food.category.toLowerCase().includes(normalizedQuery))
    )
    .slice(0, limit)
}

// Helper to search foods by barcode
const searchByBarcode = (barcode: string): Food | null => {
  return Array.from(mockFoodsDatabase.values())
    .find(food => food.janCode === barcode) || null
}

export const foodsHandlers = [
  // GET /api/foods/search
  http.get('/api/foods/search', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const category = url.searchParams.get('category')

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

    let results = searchFoods(query.trim(), 100) // Get more results first

    // Filter by category if specified
    if (category) {
      results = results.filter(food => food.category === category)
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

  // GET /api/foods/barcode/:code
  http.get('/api/foods/barcode/:code', async ({ request, params }) => {
    await delay(MOCK_DELAY.medium)

    const barcode = params.code as string

    if (!barcode || barcode.length < 8) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid barcode format',
            details: [
              { field: 'code', issue: 'Barcode must be at least 8 characters long' },
            ],
          },
        },
        { status: 400 }
      )
    }

    const food = searchByBarcode(barcode)

    if (!food) {
      return HttpResponse.json(
        {
          error: {
            code: 'FOOD_NOT_FOUND',
            message: 'Food not found for this barcode',
          },
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(food)
  }),

  // GET /api/foods/:id
  http.get('/api/foods/:id', async ({ request, params }) => {
    await delay(MOCK_DELAY.fast)

    const foodId = params.id as string
    const food = mockFoodsDatabase.get(foodId)

    if (!food) {
      return HttpResponse.json(
        {
          error: {
            code: 'FOOD_NOT_FOUND',
            message: 'Food not found',
          },
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(food)
  }),

  // GET /api/foods/categories
  http.get('/api/foods/categories', async () => {
    await delay(MOCK_DELAY.fast)

    const categories = Array.from(new Set(
      Array.from(mockFoodsDatabase.values())
        .map(food => food.category)
        .filter(Boolean)
    )).sort()

    return HttpResponse.json(categories)
  }),

  // GET /api/foods/popular
  http.get('/api/foods/popular', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Return first 'limit' foods as popular
    const popularFoods = Array.from(mockFoodsDatabase.values()).slice(0, limit)

    return HttpResponse.json(popularFoods)
  }),

  // GET /api/foods/recent
  http.get('/api/foods/recent', async ({ request }) => {
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

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // For mock, return random selection of foods as "recent"
    const allFoods = Array.from(mockFoodsDatabase.values())
    const recentFoods = allFoods
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)

    return HttpResponse.json(recentFoods)
  }),

  // GET /api/foods/custom
  http.get('/api/foods/custom', async ({ request }) => {
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
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // For mock, return all custom foods for the user
    const customFoods = Array.from(mockCustomFoodsDatabase.values())
    const total = customFoods.length
    const paginatedFoods = customFoods.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedFoods,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  }),

  // POST /api/foods/custom
  http.post('/api/foods/custom', async ({ request }) => {
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

    const body = await request.json() as Omit<CustomFood, 'id' | 'createdAt'>

    // Validate required fields
    const errors: Array<{ field: string; issue: string }> = []
    if (!body.name || body.name.trim().length < 2) {
      errors.push({ field: 'name', issue: 'Name is required and must be at least 2 characters' })
    }
    if (!body.servingSize || body.servingSize <= 0) {
      errors.push({ field: 'servingSize', issue: 'Serving size must be greater than 0' })
    }
    if (!body.servingUnit || body.servingUnit.trim().length === 0) {
      errors.push({ field: 'servingUnit', issue: 'Serving unit is required' })
    }
    if (body.calories === undefined || body.calories < 0) {
      errors.push({ field: 'calories', issue: 'Calories must be 0 or greater' })
    }
    if (body.proteinG === undefined || body.proteinG < 0) {
      errors.push({ field: 'proteinG', issue: 'Protein must be 0 or greater' })
    }
    if (body.fatG === undefined || body.fatG < 0) {
      errors.push({ field: 'fatG', issue: 'Fat must be 0 or greater' })
    }
    if (body.carbG === undefined || body.carbG < 0) {
      errors.push({ field: 'carbG', issue: 'Carbs must be 0 or greater' })
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

    const newCustomFood: CustomFood = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...body,
      name: body.name.trim(),
      servingUnit: body.servingUnit ? body.servingUnit.trim() : 'g',
      createdAt: new Date().toISOString(),
    }

    mockCustomFoodsDatabase.set(newCustomFood.id, newCustomFood)

    return HttpResponse.json(newCustomFood, { status: 201 })
  }),

  // PUT /api/foods/custom/:id
  http.put('/api/foods/custom/:id', async ({ request, params }) => {
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

    const foodId = params.id as string
    const body = await request.json() as Partial<CustomFood>

    const currentFood = mockCustomFoodsDatabase.get(foodId)
    if (!currentFood) {
      return HttpResponse.json(
        {
          error: {
            code: 'FOOD_NOT_FOUND',
            message: 'Custom food not found',
          },
        },
        { status: 404 }
      )
    }

    const updatedFood: CustomFood = {
      ...currentFood,
      ...body,
      id: foodId, // Ensure ID is not overwritten
    }

    mockCustomFoodsDatabase.set(foodId, updatedFood)

    return HttpResponse.json(updatedFood)
  }),

  // DELETE /api/foods/custom/:id
  http.delete('/api/foods/custom/:id', async ({ request, params }) => {
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

    const foodId = params.id as string
    const food = mockCustomFoodsDatabase.get(foodId)

    if (!food) {
      return HttpResponse.json(
        {
          error: {
            code: 'FOOD_NOT_FOUND',
            message: 'Custom food not found',
          },
        },
        { status: 404 }
      )
    }

    mockCustomFoodsDatabase.delete(foodId)

    return HttpResponse.json({ success: true })
  }),

  // POST /api/foods/analyze-image
  http.post('/api/foods/analyze-image', async ({ request }) => {
    await delay(MOCK_DELAY.network) // Longer delay for image processing

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

    // Mock image analysis result
    const mockAnalysis = {
      foods: [
        {
          name: 'サラダチキン',
          confidence: 0.89,
          estimatedQuantity: 120,
          unit: 'g',
          nutrition: {
            calories: 129,
            proteinG: 28.8,
            fatG: 1.4,
            carbG: 0.4,
          },
        },
        {
          name: 'ブロッコリー',
          confidence: 0.76,
          estimatedQuantity: 80,
          unit: 'g',
          nutrition: {
            calories: 26,
            proteinG: 3.4,
            fatG: 0.4,
            carbG: 4.2,
          },
        },
      ],
      totalNutrition: {
        calories: 155,
        proteinG: 32.2,
        fatG: 1.8,
        carbG: 4.6,
      },
      suggestions: [
        'Consider adding a source of healthy carbs like quinoa or brown rice',
        'Great protein content in this meal!',
      ],
    }

    return HttpResponse.json(mockAnalysis)
  }),
]
