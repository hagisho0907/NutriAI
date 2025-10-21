# NutriAI Zustand Stores

This directory contains all the Zustand stores for state management in the NutriAI application.

## Store Structure

### Core Stores

1. **authStore.ts** - User authentication and profile management
2. **nutritionStore.ts** - Daily nutrition tracking and goals
3. **mealStore.ts** - Meal logging and templates
4. **exerciseStore.ts** - Exercise logging and tracking
5. **bodyMetricsStore.ts** - Body metrics tracking
6. **chatStore.ts** - Chat history and AI interactions
7. **uiStore.ts** - UI state (loading, errors, notifications)

### Utility Files

- **index.ts** - Main exports and store configuration
- **types.ts** - Store-specific TypeScript types
- **utils.ts** - Helper functions and utilities

## Usage Examples

### Basic Store Usage

```typescript
import { useAuthStore, useNutritionStore, useUIStore } from '@/stores';

function MyComponent() {
  const { user, login, logout } = useAuthStore();
  const { currentDateNutrition, fetchDailyNutrition } = useNutritionStore();
  const { showSuccess, showError } = useUIStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      showSuccess('Login Successful', 'Welcome back!');
    } catch (error) {
      showError('Login Failed', 'Please check your credentials.');
    }
  };

  // Component logic...
}
```

### Store Initialization

```typescript
import { useStoreInitialization } from '@/stores';

function App() {
  const { initializeStores, isInitialized } = useStoreInitialization();

  useEffect(() => {
    initializeStores();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <AppContent />;
}
```

### Complex Operations

```typescript
import { useStoreActions } from '@/stores';

function MealLoggingComponent() {
  const { logMealAndUpdateNutrition } = useStoreActions();

  const handleMealSubmit = async (mealData) => {
    await logMealAndUpdateNutrition(mealData);
    // This will automatically update both meal and nutrition stores
  };
}
```

## Store Features

### State Management
- ✅ Type-safe with TypeScript
- ✅ Persistent state with localStorage
- ✅ Loading and error states
- ✅ CRUD operations for all entities

### Data Flow
- ✅ Reactive updates
- ✅ Computed values and selectors
- ✅ Cross-store interactions
- ✅ Optimistic updates

### Developer Experience
- ✅ Hot reloading support
- ✅ DevTools integration
- ✅ Error handling
- ✅ Performance optimizations

## Store Patterns

### Async Actions
All async actions follow the same pattern:
1. Set loading state
2. Try operation
3. Update state on success
4. Set error on failure
5. Clear loading state

### Error Handling
Errors are handled consistently across stores with:
- Error state management
- User-friendly error messages
- Automatic error clearing

### Persistence
Selective persistence for:
- User authentication
- User preferences
- Cached data
- Form drafts

## Integration with Mock Data

The stores are designed to work with mock data during development and can easily switch to real API calls by replacing the mock implementations in each store's async actions.

## Performance Considerations

- Selective subscriptions to prevent unnecessary re-renders
- Computed values are memoized
- Large lists use pagination
- Debounced API calls for search and filters

## Testing

Stores can be easily tested by:
1. Mocking the store state
2. Testing individual actions
3. Verifying state changes
4. Testing error conditions

## Migration Path

When ready to integrate with real APIs:
1. Replace mock data calls with actual API calls
2. Update error handling for API errors
3. Add authentication headers
4. Implement proper caching strategies