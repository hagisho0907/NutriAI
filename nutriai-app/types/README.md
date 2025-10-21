# NutriAI TypeScript Types

This directory contains all TypeScript type definitions for the NutriAI application, organized by domain.

## Type Organization

### Core Domain Types

- **user.ts** - User accounts, profiles, goals, and authentication
- **nutrition.ts** - Nutrition data, daily summaries, and nutrition goals
- **food.ts** - Food items, custom foods, and food search
- **meal.ts** - Meal logging, meal templates, and AI estimation
- **exercise.ts** - Exercise templates, logs, and statistics
- **body-metrics.ts** - Weight tracking, body composition, and progress
- **chat.ts** - AI chat sessions, messages, and suggestions

### Infrastructure Types

- **api.ts** - API responses, requests, and error handling
- **common.ts** - Shared utilities, enums, and helper types

## Type Naming Conventions

1. **Interfaces** - PascalCase (e.g., `UserProfile`, `MealTemplate`)
2. **Type Aliases** - PascalCase (e.g., `Gender`, `MealType`)
3. **Enums/Unions** - Use string literal unions instead of enums for better type safety
4. **Request/Response** - Suffix with `Request` or `Response` (e.g., `CreateMealRequest`)

## Usage Examples

### Importing Types

```typescript
// Import specific types
import { User, UserProfile, UserGoal } from '@/types/user';

// Import all types from a module
import * as FoodTypes from '@/types/food';

// Import from index for common types
import { Meal, Exercise, BodyMetrics } from '@/types';
```

### Type Alignment with Database

The types are designed to match the database schema defined in the DB design document:
- Nullable fields are marked with `?`
- Date strings use ISO format
- IDs are strings (UUIDs in the database)
- Numeric values match database precision requirements

### Mock Data Compatibility

The mock data in `/lib/mockData.ts` uses simplified versions of these types for convenience:
- `SimplifiedUserProfile` - Includes `id` and `email` directly
- `SimplifiedMeal` - Uses `date` instead of `loggedAt`
- `SimplifiedExercise` - Omits some fields for mock simplicity

## Type Safety Guidelines

1. **Avoid `any`** - Use specific types or `unknown` when type is truly unknown
2. **Use Optional Chaining** - For nullable fields (e.g., `user.profile?.bodyFatPct`)
3. **Validate API Responses** - Use type guards or validation libraries
4. **Prefer Unions over Enums** - String literal unions provide better type inference

## Future Considerations

- Add validation schemas (e.g., using Zod) alongside types
- Generate types from OpenAPI spec when backend is implemented
- Add branded types for IDs to prevent mixing different entity IDs
- Consider using discriminated unions for polymorphic types