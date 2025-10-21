# React Query Implementation for NutriAI

This directory contains a comprehensive React Query implementation for the NutriAI application, providing efficient data fetching, caching, and state management for all API interactions.

## Features

- ✅ **Complete API Coverage**: Hooks for all API services (auth, nutrition, meals, exercises, body metrics, chat, foods)
- ✅ **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- ✅ **Smart Caching**: Intelligent cache invalidation and stale-while-revalidate strategies
- ✅ **Infinite Queries**: Pagination support for large datasets
- ✅ **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Error Handling**: Robust error handling with retry strategies
- ✅ **Performance Optimized**: Efficient query key management and cache strategies
- ✅ **MSW Integration**: Seamless integration with Mock Service Worker for development

## Directory Structure

```
lib/react-query/
├── config.ts           # React Query configuration and utilities
├── providers.tsx       # React Query provider component
├── query-keys.ts       # Centralized query key factory
├── types.ts           # Comprehensive type definitions
├── examples.tsx       # Usage examples and patterns
├── hooks/             # Individual hook implementations
│   ├── index.ts       # Main hooks export
│   ├── auth.ts        # Authentication hooks
│   ├── nutrition.ts   # Nutrition tracking hooks
│   ├── meals.ts       # Meal logging hooks
│   ├── exercises.ts   # Exercise tracking hooks
│   ├── body-metrics.ts # Body metrics hooks
│   ├── chat.ts        # AI chat hooks
│   └── foods.ts       # Food search and management hooks
└── index.ts           # Main library export
```

## Quick Start

### 1. Provider Setup

The React Query provider is already integrated into the app's `AppProvider`:

```tsx
import { ReactQueryProvider } from '@/lib/react-query'

function App() {
  return (
    <ReactQueryProvider>
      {/* Your app components */}
    </ReactQueryProvider>
  )
}
```

### 2. Basic Usage

```tsx
import { useCurrentUser, useDailyNutrition, useLogMeal } from '@/lib/react-query'

function MyComponent() {
  // Query hooks - automatic caching and refetching
  const { data: user, isLoading } = useCurrentUser()
  const { data: nutrition } = useDailyNutrition('2024-01-15')
  
  // Mutation hooks - optimistic updates and error handling
  const logMeal = useLogMeal()
  
  const handleLogMeal = async (mealData) => {
    try {
      await logMeal.mutateAsync(mealData)
      // UI updates automatically due to cache invalidation
    } catch (error) {
      // Error handling
    }
  }
  
  return (
    <div>
      {isLoading ? 'Loading...' : `Welcome ${user?.email}`}
      <button onClick={() => handleLogMeal(mealData)}>
        Log Meal
      </button>
    </div>
  )
}
```

## Hook Categories

### Authentication Hooks

```tsx
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useGuestLogin,
  useLogout,
  useIsAuthenticated,
} from '@/lib/react-query'
```

**Query Hooks:**
- `useCurrentUser()` - Get current user profile
- `useIsAuthenticated()` - Check authentication status

**Mutation Hooks:**
- `useLogin()` - User login
- `useRegister()` - User registration
- `useGuestLogin()` - Guest session
- `useLogout()` - User logout
- `useUpdateProfile()` - Update user profile

### Nutrition Hooks

```tsx
import {
  useNutritionGoals,
  useDailyNutrition,
  useNutritionHistory,
  useUpdateNutritionGoals,
  useLogWater,
} from '@/lib/react-query'
```

**Query Hooks:**
- `useNutritionGoals()` - Get nutrition goals
- `useDailyNutrition(date)` - Get daily nutrition data
- `useNutritionSummary(date)` - Get comprehensive nutrition summary
- `useNutritionHistory(startDate, endDate)` - Get nutrition history with infinite scroll
- `useWaterIntake(date)` - Get water intake data

**Mutation Hooks:**
- `useUpdateNutritionGoals()` - Update nutrition goals
- `useLogWater()` - Log water intake
- `useBulkUpdateNutrition()` - Bulk nutrition updates

### Meals Hooks

```tsx
import {
  useDailyMeals,
  useMealTemplates,
  useLogMeal,
  useUpdateMeal,
  useDeleteMeal,
} from '@/lib/react-query'
```

**Query Hooks:**
- `useDailyMeals(date)` - Get meals for a specific date
- `useMealLog(params)` - Get meal log with filtering
- `useInfiniteMealLog(params)` - Infinite scroll meal log
- `useMealTemplates()` - Get meal templates
- `useSearchMeals(query)` - Search meals
- `useMealAnalysis(mealId)` - Get meal nutrition analysis

**Mutation Hooks:**
- `useLogMeal()` - Log new meal
- `useUpdateMeal()` - Update existing meal
- `useDeleteMeal()` - Delete meal
- `useCreateMealTemplate()` - Create meal template
- `useUseMealTemplate()` - Use template to create meal
- `useBulkLogMeals()` - Log multiple meals

### Exercise Hooks

```tsx
import {
  useDailyExercises,
  useExerciseTemplates,
  useLogExercise,
  useCalculateCalories,
} from '@/lib/react-query'
```

**Query Hooks:**
- `useDailyExercises(date)` - Get exercises for a date
- `useExerciseTemplates()` - Get exercise templates
- `useSearchExercises(params)` - Search exercises
- `useExerciseCategories()` - Get exercise categories
- `useExerciseStats(startDate, endDate)` - Get exercise statistics

**Mutation Hooks:**
- `useLogExercise()` - Log new exercise
- `useUpdateExerciseLog()` - Update exercise log
- `useDeleteExerciseLog()` - Delete exercise
- `useCalculateCalories()` - Calculate calories burned
- `useBulkLogExercises()` - Log multiple exercises

### Body Metrics Hooks

```tsx
import {
  useLatestBodyMetrics,
  useBodyMetricsHistory,
  useAddBodyMetrics,
  useBodyMetricsTrends,
} from '@/lib/react-query'
```

**Query Hooks:**
- `useLatestBodyMetrics()` - Get latest measurements
- `useBodyMetricsHistory(startDate, endDate)` - Get metrics history
- `useBodyMetricsStats(params)` - Get statistics
- `useBodyMetricsProgress(period)` - Get progress data
- `useBodyMetricsTrends(metric, period)` - Get trend analysis

**Mutation Hooks:**
- `useAddBodyMetrics()` - Add new measurement
- `useUpdateBodyMetrics()` - Update measurement
- `useDeleteBodyMetrics()` - Delete measurement
- `useCalculateBMI()` - Calculate BMI

### Chat Hooks

```tsx
import {
  useChatMessages,
  useChatSuggestions,
  useSendMessage,
  useAIInsights,
} from '@/lib/react-query'
```

**Query Hooks:**
- `useChatMessages(params)` - Get chat messages
- `useInfiniteChatMessages()` - Infinite scroll chat
- `useChatSuggestions(context)` - Get AI suggestions
- `useConversationSummary()` - Get conversation summary
- `useAIInsights()` - Get AI-generated insights

**Mutation Hooks:**
- `useSendMessage()` - Send message to AI
- `useDeleteMessage()` - Delete message
- `useClearMessages()` - Clear chat history
- `useSubmitFeedback()` - Submit message feedback

### Foods Hooks

```tsx
import {
  useSearchFoods,
  useSearchByBarcode,
  useCustomFoods,
  useCreateCustomFood,
  useFavoriteFoods,
} from '@/lib/react-query'
```

**Query Hooks:**
- `useSearchFoods(params)` - Search foods database
- `useSearchByBarcode(barcode)` - Search by barcode
- `useFoodById(id)` - Get food details
- `useCustomFoods()` - Get user's custom foods
- `useFavoriteFoods()` - Get favorite foods
- `useFoodRecommendations()` - Get food recommendations

**Mutation Hooks:**
- `useCreateCustomFood()` - Create custom food
- `useUpdateCustomFood()` - Update custom food
- `useDeleteCustomFood()` - Delete custom food
- `useAnalyzeFoodImage()` - AI image analysis
- `useAddToFavorites()` - Add to favorites
- `useRemoveFromFavorites()` - Remove from favorites

## Advanced Features

### Query Key Management

All queries use a centralized query key factory for consistent cache management:

```tsx
import { queryKeys } from '@/lib/react-query'

// Usage in components
const { data } = useQuery({
  queryKey: queryKeys.nutrition.daily('2024-01-15'),
  queryFn: () => nutritionService.getDailyNutrition('2024-01-15')
})

// Manual cache manipulation
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all })
```

### Optimistic Updates

Most mutation hooks include optimistic updates for immediate UI feedback:

```tsx
const logMeal = useLogMeal()

// This will immediately update the UI, then rollback on error
await logMeal.mutateAsync(mealData)
```

### Error Handling

Comprehensive error handling with automatic retries:

```tsx
const { data, error, isError, refetch } = useDailyNutrition(date)

if (isError) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  )
}
```

### Infinite Queries

For paginated data with seamless loading:

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteMealLog({ limit: 20 })

return (
  <div>
    {data?.pages.map((page) =>
      page.items.map((meal) => <MealCard key={meal.id} meal={meal} />)
    )}
    
    {hasNextPage && (
      <button 
        onClick={() => fetchNextPage()}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading...' : 'Load More'}
      </button>
    )}
  </div>
)
```

## Cache Configuration

The implementation uses optimized cache settings:

- **Short-term data** (5 minutes): Real-time data like daily nutrition
- **Medium-term data** (15-30 minutes): User preferences and templates
- **Long-term data** (1+ hours): Static data like food databases and categories

## Integration with Zustand

While React Query handles server state, the existing Zustand stores can still be used for client-side state:

```tsx
// Server state (React Query)
const { data: nutrition } = useDailyNutrition(date)

// Client state (Zustand)
const { selectedDate, setSelectedDate } = useNutritionStore()
```

## Development Tools

React Query DevTools are automatically included in development mode for debugging and cache inspection.

## Best Practices

1. **Use query hooks for server state** - Let React Query handle caching and synchronization
2. **Use mutation hooks for actions** - Leverage optimistic updates and error handling
3. **Leverage query keys** - Use the centralized factory for consistency
4. **Handle loading and error states** - Provide good UX with proper state handling
5. **Use infinite queries for pagination** - Better performance than offset-based pagination
6. **Combine hooks thoughtfully** - Avoid over-fetching by using related data efficiently

## Performance Considerations

- Queries are automatically deduplicated
- Background refetching keeps data fresh
- Intelligent cache invalidation minimizes unnecessary requests
- Optimistic updates provide immediate feedback
- Stale-while-revalidate ensures responsive UX

## Testing

All hooks are designed to work with React Query's testing utilities:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('useCurrentUser hook', async () => {
  const { result } = renderHook(() => useCurrentUser(), {
    wrapper: createWrapper(),
  })
  
  // Test implementation
})
```

This React Query implementation provides a robust, type-safe, and performant foundation for all data fetching needs in the NutriAI application.