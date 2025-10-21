// Meals MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockMeals, mockCustomMeals } from '../../mockData'
import type { Meal, MealTemplate, MealItem } from '../../../types'

// Mock meals database
const mockMealsDatabase = new Map<string, Meal>()
const mockMealTemplatesDatabase = new Map<string, MealTemplate>()

// Helper to extract user ID from auth token
const getUserIdFromToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return null
  }
  return '1'
}

// Helper to convert simplified meal to full meal
const convertToFullMeal = (simplifiedMeal: any, userId: string): Meal => {
  const totalNutrition = simplifiedMeal.items.reduce(
    (total: any, item: any) => ({
      calories: total.calories + item.calories,
      proteinG: total.proteinG + item.proteinG,
      fatG: total.fatG + item.fatG,
      carbG: total.carbG + item.carbG,
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbG: 0 }
  )

  return {
    id: simplifiedMeal.id,
    userId,
    mealType: simplifiedMeal.mealType,
    loggedAt: new Date(simplifiedMeal.date + 'T12:00:00Z').toISOString(),
    source: 'manual',
    aiEstimated: false,
    totalCalories: totalNutrition.calories,
    totalProteinG: totalNutrition.proteinG,
    totalFatG: totalNutrition.fatG,
    totalCarbG: totalNutrition.carbG,
    items: simplifiedMeal.items.map((item: any, index: number): MealItem => ({
      id: item.id,
      mealId: simplifiedMeal.id,
      foodId: `food_${item.id}`,
      foodName: item.foodName,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      proteinG: item.proteinG,
      fatG: item.fatG,
      carbG: item.carbG,
      fiberG: item.fiberG || 0,
      confidence: 1.0,
      createdAt: new Date().toISOString(),
    })),
    notes: simplifiedMeal.notes || '',
    photoUrl: simplifiedMeal.photoUrl,
    createdAt: new Date().toISOString(),
  }
}

// Initialize with default data
mockMeals.forEach(meal => {
  const fullMeal = convertToFullMeal(meal, '1')
  mockMealsDatabase.set(meal.id, fullMeal)
})

// Convert custom meals to templates
mockCustomMeals.forEach((customMeal, index) => {
  const template: MealTemplate = {
    id: customMeal.id,
    userId: '1',
    name: customMeal.name,
    instructions: customMeal.instructions || '',
    photoUrl: customMeal.photoUrl,
    isPublic: customMeal.isPublic ?? false,
    totalNutrition: {
      calories: customMeal.totalCalories,
      proteinG: customMeal.totalProteinG,
      fatG: customMeal.totalFatG,
      carbG: customMeal.totalCarbG,
      fiberG: 0,
      sugarG: 0,
    },
    foods: customMeal.foods.map(food => ({
      foodId: food.foodId,
      foodName: food.foodName,
      quantity: food.quantity,
      unit: food.unit,
      nutrition: {
        calories: food.calories,
        proteinG: food.proteinG,
        fatG: food.fatG,
        carbG: food.carbG,
      },
    })),
    createdAt: new Date(customMeal.createdAt).toISOString(),
    updatedAt: new Date(customMeal.createdAt).toISOString(),
  }
  mockMealTemplatesDatabase.set(template.id, template)
})

export const mealsHandlers = [
  // GET /api/meals/log
  http.get('/api/meals/log', async ({ request }) => {
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

    let meals = Array.from(mockMealsDatabase.values()).filter(meal => meal.userId === userId)

    // Filter by date or date range
    if (date) {
      const targetDate = new Date(date)
      meals = meals.filter(meal => {
        const mealDate = new Date(meal.loggedAt)
        return mealDate.toDateString() === targetDate.toDateString()
      })
    } else if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      meals = meals.filter(meal => {
        const mealDate = new Date(meal.loggedAt)
        return mealDate >= start && mealDate <= end
      })
    }

    // Sort by logged date (newest first)
    meals.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())

    // Apply pagination
    const total = meals.length
    const paginatedMeals = meals.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedMeals,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  }),

  // POST /api/meals/log
  http.post('/api/meals/log', async ({ request }) => {
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

    const body = await request.json() as Omit<Meal, 'id' | 'userId' | 'createdAt' | 'totalCalories' | 'totalProteinG' | 'totalFatG' | 'totalCarbG'>

    // Validate required fields
    const errors: Array<{ field: string; issue: string }> = []
    if (!body.mealType) {
      errors.push({ field: 'mealType', issue: 'Meal type is required' })
    }
    if (!body.items || body.items.length === 0) {
      errors.push({ field: 'items', issue: 'At least one meal item is required' })
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

    // Calculate totals
    const totals = body.items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        proteinG: acc.proteinG + item.proteinG,
        fatG: acc.fatG + item.fatG,
        carbG: acc.carbG + item.carbG,
      }),
      { calories: 0, proteinG: 0, fatG: 0, carbG: 0 }
    )

    const newMeal: Meal = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...body,
      totalCalories: totals.calories,
      totalProteinG: totals.proteinG,
      totalFatG: totals.fatG,
      totalCarbG: totals.carbG,
      source: body.source || 'manual',
      aiEstimated: body.aiEstimated || false,
      loggedAt: body.loggedAt || new Date().toISOString(),
      items: body.items.map((item, index) => ({
        ...item,
        id: item.id || `item_${Date.now()}_${index}`,
        mealId: '',
        confidence: item.confidence || 1.0,
        createdAt: item.createdAt || new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    }

    // Update meal item IDs to reference the meal
    newMeal.items = newMeal.items.map(item => ({ ...item, mealId: newMeal.id }))

    mockMealsDatabase.set(newMeal.id, newMeal)

    return HttpResponse.json(newMeal, { status: 201 })
  }),

  // PUT /api/meals/log/:id
  http.put('/api/meals/log/:id', async ({ request, params }) => {
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

    const mealId = params.id as string
    const body = await request.json() as Partial<Meal>

    const currentMeal = mockMealsDatabase.get(mealId)
    if (!currentMeal || currentMeal.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'MEAL_NOT_FOUND',
            message: 'Meal not found',
          },
        },
        { status: 404 }
      )
    }

    // Recalculate totals if items were updated
    let totals = {
      calories: currentMeal.totalCalories,
      proteinG: currentMeal.totalProteinG,
      fatG: currentMeal.totalFatG,
      carbG: currentMeal.totalCarbG,
    }

    if (body.items) {
      totals = body.items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          proteinG: acc.proteinG + item.proteinG,
          fatG: acc.fatG + item.fatG,
          carbG: acc.carbG + item.carbG,
        }),
        { calories: 0, proteinG: 0, fatG: 0, carbG: 0 }
      )
    }

    const updatedMeal: Meal = {
      ...currentMeal,
      ...body,
      id: mealId, // Ensure ID is not overwritten
      userId, // Ensure userId is not overwritten
      totalCalories: totals.calories,
      totalProteinG: totals.proteinG,
      totalFatG: totals.fatG,
      totalCarbG: totals.carbG,
    }

    mockMealsDatabase.set(mealId, updatedMeal)

    return HttpResponse.json(updatedMeal)
  }),

  // DELETE /api/meals/log/:id
  http.delete('/api/meals/log/:id', async ({ request, params }) => {
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

    const mealId = params.id as string
    const meal = mockMealsDatabase.get(mealId)

    if (!meal || meal.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'MEAL_NOT_FOUND',
            message: 'Meal not found',
          },
        },
        { status: 404 }
      )
    }

    mockMealsDatabase.delete(mealId)

    return HttpResponse.json({ success: true })
  }),

  // GET /api/meals/templates
  http.get('/api/meals/templates', async ({ request }) => {
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
    const isPublic = url.searchParams.get('public') === 'true'

    let templates = Array.from(mockMealTemplatesDatabase.values())

    // Filter by ownership and public status
    if (isPublic) {
      templates = templates.filter(template => template.isPublic)
    } else {
      templates = templates.filter(template => template.userId === userId)
    }

    // Sort by creation date (newest first)
    templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

  // POST /api/meals/templates
  http.post('/api/meals/templates', async ({ request }) => {
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

    const body = await request.json() as Omit<MealTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>

    // Validate required fields
    const errors: Array<{ field: string; issue: string }> = []
    if (!body.name || body.name.trim().length < 2) {
      errors.push({ field: 'name', issue: 'Template name is required and must be at least 2 characters' })
    }
    if (!body.foods || body.foods.length === 0) {
      errors.push({ field: 'foods', issue: 'At least one food item is required' })
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

    const newTemplate: MealTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...body,
      name: body.name.trim(),
      isPublic: body.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockMealTemplatesDatabase.set(newTemplate.id, newTemplate)

    return HttpResponse.json(newTemplate, { status: 201 })
  }),

  // PUT /api/meals/templates/:id
  http.put('/api/meals/templates/:id', async ({ request, params }) => {
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

    const templateId = params.id as string
    const body = await request.json() as Partial<MealTemplate>

    const currentTemplate = mockMealTemplatesDatabase.get(templateId)
    if (!currentTemplate || currentTemplate.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Meal template not found',
          },
        },
        { status: 404 }
      )
    }

    const updatedTemplate: MealTemplate = {
      ...currentTemplate,
      ...body,
      id: templateId, // Ensure ID is not overwritten
      userId, // Ensure userId is not overwritten
      updatedAt: new Date().toISOString(),
    }

    mockMealTemplatesDatabase.set(templateId, updatedTemplate)

    return HttpResponse.json(updatedTemplate)
  }),

  // DELETE /api/meals/templates/:id
  http.delete('/api/meals/templates/:id', async ({ request, params }) => {
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

    const templateId = params.id as string
    const template = mockMealTemplatesDatabase.get(templateId)

    if (!template || template.userId !== userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Meal template not found',
          },
        },
        { status: 404 }
      )
    }

    mockMealTemplatesDatabase.delete(templateId)

    return HttpResponse.json({ success: true })
  }),

  // POST /api/meals/templates/:id/use
  http.post('/api/meals/templates/:id/use', async ({ request, params }) => {
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

    const templateId = params.id as string
    const body = await request.json() as { mealType: Meal['mealType']; loggedAt?: string }

    const template = mockMealTemplatesDatabase.get(templateId)
    if (!template) {
      return HttpResponse.json(
        {
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Meal template not found',
          },
        },
        { status: 404 }
      )
    }

    // Create a new meal from the template
    const newMeal: Meal = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      mealType: body.mealType,
      loggedAt: body.loggedAt ? new Date(body.loggedAt).toISOString() : new Date().toISOString(),
      source: 'template',
      aiEstimated: false,
      totalCalories: template.totalNutrition.calories,
      totalProteinG: template.totalNutrition.proteinG,
      totalFatG: template.totalNutrition.fatG,
      totalCarbG: template.totalNutrition.carbG,
      items: template.foods.map((food, index): MealItem => ({
        id: `item_${Date.now()}_${index}`,
        mealId: '',
        foodId: food.foodId,
        foodName: food.foodName,
        quantity: food.quantity,
        unit: food.unit,
        calories: Math.round((template.totalNutrition.calories / template.foods.length)),
        proteinG: Math.round((template.totalNutrition.proteinG / template.foods.length)),
        fatG: Math.round((template.totalNutrition.fatG / template.foods.length)),
        carbG: Math.round((template.totalNutrition.carbG / template.foods.length)),
        fiberG: 0,
        confidence: 1.0,
        createdAt: new Date().toISOString(),
      })),
      notes: `Created from template: ${template.name}`,
      photoUrl: template.photoUrl,
      createdAt: new Date().toISOString(),
    }

    // Update meal item IDs to reference the meal
    newMeal.items = newMeal.items.map(item => ({ ...item, mealId: newMeal.id }))

    mockMealsDatabase.set(newMeal.id, newMeal)

    return HttpResponse.json(newMeal, { status: 201 })
  }),
]
