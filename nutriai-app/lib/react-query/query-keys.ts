// Query key factory for consistent cache management
// This factory ensures type-safe and consistent query keys across the app

export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'current-user'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Nutrition queries
  nutrition: {
    all: ['nutrition'] as const,
    goals: () => [...queryKeys.nutrition.all, 'goals'] as const,
    daily: (date: string) => [...queryKeys.nutrition.all, 'daily', date] as const,
    history: (startDate: string, endDate: string, filters?: Record<string, unknown>) => 
      [...queryKeys.nutrition.all, 'history', { startDate, endDate, ...filters }] as const,
    summary: (date: string) => [...queryKeys.nutrition.all, 'summary', date] as const,
    water: (date: string) => [...queryKeys.nutrition.all, 'water', date] as const,
  },

  // Meals queries
  meals: {
    all: ['meals'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.meals.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.meals.all, 'detail', id] as const,
    templates: () => [...queryKeys.meals.all, 'templates'] as const,
    daily: (date: string) => [...queryKeys.meals.all, 'daily', date] as const,
    search: (query: string, filters?: Record<string, unknown>) => 
      [...queryKeys.meals.all, 'search', { query, ...filters }] as const,
    analysis: (mealId: string) => [...queryKeys.meals.all, 'analysis', mealId] as const,
  },

  // Foods queries
  foods: {
    all: ['foods'] as const,
    search: (query: string, filters?: Record<string, unknown>) => 
      [...queryKeys.foods.all, 'search', { query, ...filters }] as const,
    detail: (id: string) => [...queryKeys.foods.all, 'detail', id] as const,
    barcode: (barcode: string) => [...queryKeys.foods.all, 'barcode', barcode] as const,
    custom: (userId?: string) => [...queryKeys.foods.all, 'custom', userId] as const,
    favorites: () => [...queryKeys.foods.all, 'favorites'] as const,
    recent: () => [...queryKeys.foods.all, 'recent'] as const,
    recommendations: (filters?: Record<string, unknown>) => 
      [...queryKeys.foods.all, 'recommendations', filters] as const,
  },

  // Exercises queries
  exercises: {
    all: ['exercises'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.exercises.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.exercises.all, 'detail', id] as const,
    templates: () => [...queryKeys.exercises.all, 'templates'] as const,
    search: (query: string, filters?: Record<string, unknown>) => 
      [...queryKeys.exercises.all, 'search', { query, ...filters }] as const,
    daily: (date: string) => [...queryKeys.exercises.all, 'daily', date] as const,
    history: (startDate: string, endDate: string, filters?: Record<string, unknown>) => 
      [...queryKeys.exercises.all, 'history', { startDate, endDate, ...filters }] as const,
    categories: () => [...queryKeys.exercises.all, 'categories'] as const,
  },

  // Body metrics queries
  bodyMetrics: {
    all: ['body-metrics'] as const,
    latest: () => [...queryKeys.bodyMetrics.all, 'latest'] as const,
    history: (startDate: string, endDate: string, metric?: string) => 
      [...queryKeys.bodyMetrics.all, 'history', { startDate, endDate, metric }] as const,
    statistics: (period: string, metric?: string) => 
      [...queryKeys.bodyMetrics.all, 'statistics', { period, metric }] as const,
    goals: () => [...queryKeys.bodyMetrics.all, 'goals'] as const,
    trends: (metric: string, period: string) => 
      [...queryKeys.bodyMetrics.all, 'trends', { metric, period }] as const,
  },

  // Chat queries
  chat: {
    all: ['chat'] as const,
    conversations: () => [...queryKeys.chat.all, 'conversations'] as const,
    conversation: (id: string) => [...queryKeys.chat.all, 'conversation', id] as const,
    messages: (conversationId: string, limit?: number, offset?: number) => 
      [...queryKeys.chat.all, 'messages', { conversationId, limit, offset }] as const,
    suggestions: (context?: Record<string, unknown>) => 
      [...queryKeys.chat.all, 'suggestions', context] as const,
    aiInsights: (date?: string) => [...queryKeys.chat.all, 'ai-insights', date] as const,
  },

  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    today: (date?: string) => [...queryKeys.dashboard.all, 'today', date] as const,
    summary: (date: string) => [...queryKeys.dashboard.all, 'summary', date] as const,
    streak: () => [...queryKeys.dashboard.all, 'streak'] as const,
    recommendations: () => [...queryKeys.dashboard.all, 'recommendations'] as const,
  },

  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    progress: (period: string, filters?: Record<string, unknown>) => 
      [...queryKeys.analytics.all, 'progress', { period, ...filters }] as const,
    trends: (metric: string, period: string) => 
      [...queryKeys.analytics.all, 'trends', { metric, period }] as const,
    goals: (period: string) => [...queryKeys.analytics.all, 'goals', period] as const,
    insights: (period: string) => [...queryKeys.analytics.all, 'insights', period] as const,
  },

  // Utility queries
  utility: {
    all: ['utility'] as const,
    health: () => [...queryKeys.utility.all, 'health'] as const,
    upload: () => [...queryKeys.utility.all, 'upload'] as const,
  },
} as const

// Helper function to invalidate related queries
export const getRelatedQueryKeys = {
  // When nutrition changes, invalidate related queries
  onNutritionChange: (date: string) => [
    queryKeys.nutrition.daily(date),
    queryKeys.nutrition.summary(date),
    queryKeys.dashboard.today(date),
    queryKeys.dashboard.summary(date),
    queryKeys.meals.daily(date),
  ],

  // When meals change, invalidate related queries
  onMealsChange: (date: string) => [
    queryKeys.meals.daily(date),
    queryKeys.nutrition.daily(date),
    queryKeys.nutrition.summary(date),
    queryKeys.dashboard.today(date),
    queryKeys.dashboard.summary(date),
  ],

  // When exercises change, invalidate related queries
  onExercisesChange: (date: string) => [
    queryKeys.exercises.daily(date),
    queryKeys.dashboard.today(date),
    queryKeys.dashboard.summary(date),
  ],

  // When body metrics change, invalidate related queries
  onBodyMetricsChange: () => [
    queryKeys.bodyMetrics.latest(),
    queryKeys.dashboard.today(),
    queryKeys.analytics.progress('30d'),
  ],

  // When auth changes, invalidate user-specific queries
  onAuthChange: () => [
    queryKeys.auth.currentUser(),
    queryKeys.auth.profile(),
    queryKeys.nutrition.goals(),
    queryKeys.bodyMetrics.goals(),
    queryKeys.foods.custom(),
    queryKeys.foods.favorites(),
    queryKeys.meals.templates(),
    queryKeys.exercises.templates(),
    queryKeys.chat.conversations(),
  ],
}
