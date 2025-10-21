# Mock Service Worker (MSW) Setup

This directory contains the MSW configuration for the NutriAI application, providing comprehensive API mocking capabilities for development and testing.

## Overview

MSW intercepts HTTP requests at the network level and returns mock responses, allowing the application to work with realistic data without requiring a backend server.

## Structure

```
lib/msw/
├── browser.ts           # Browser MSW setup
├── node.ts             # Node.js MSW setup  
├── index.ts            # Main entry point
├── init.ts             # Auto-initialization utility
├── handlers/
│   ├── index.ts        # Aggregated handlers
│   ├── auth.ts         # Authentication endpoints
│   ├── user.ts         # User profile endpoints
│   ├── nutrition.ts    # Nutrition tracking endpoints
│   ├── foods.ts        # Food search/management endpoints
│   ├── meals.ts        # Meal logging endpoints
│   ├── exercises.ts    # Exercise tracking endpoints
│   ├── body-metrics.ts # Body metrics endpoints
│   └── chat.ts         # AI chat endpoints
└── README.md           # This file
```

## API Endpoints

### Authentication (`/auth/*`)
- `POST /auth/login` - Email/password login
- `POST /auth/register` - User registration
- `POST /auth/guest-login` - Guest session
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Logout
- `GET /auth/me` - Current user profile

### User Management (`/api/user/*`)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/goals` - Get user goals
- `POST /api/user/goals` - Create new goal
- `PUT /api/user/goals/:id` - Update goal
- `DELETE /api/user/goals/:id` - Delete goal
- `GET /api/user/preferences` - Get preferences
- `PUT /api/user/preferences` - Update preferences

### Nutrition (`/api/nutrition/*`)
- `GET /api/nutrition/goals` - Get nutrition goals
- `PUT /api/nutrition/goals` - Update nutrition goals
- `GET /api/nutrition/daily` - Get daily nutrition
- `GET /api/nutrition/history` - Get nutrition history
- `GET /api/nutrition/summary` - Get nutrition summary
- `POST /api/nutrition/water` - Log water intake

### Foods (`/api/foods/*`)
- `GET /api/foods/search` - Search foods
- `GET /api/foods/barcode/:code` - Search by barcode
- `GET /api/foods/:id` - Get food details
- `GET /api/foods/categories` - Get food categories
- `GET /api/foods/popular` - Get popular foods
- `GET /api/foods/recent` - Get recent foods
- `GET /api/foods/custom` - Get custom foods
- `POST /api/foods/custom` - Create custom food
- `PUT /api/foods/custom/:id` - Update custom food
- `DELETE /api/foods/custom/:id` - Delete custom food
- `POST /api/foods/analyze-image` - AI image analysis

### Meals (`/api/meals/*`)
- `GET /api/meals/log` - Get meal logs
- `POST /api/meals/log` - Log meal
- `PUT /api/meals/log/:id` - Update meal log
- `DELETE /api/meals/log/:id` - Delete meal log
- `GET /api/meals/templates` - Get meal templates
- `POST /api/meals/templates` - Create meal template
- `PUT /api/meals/templates/:id` - Update template
- `DELETE /api/meals/templates/:id` - Delete template
- `POST /api/meals/templates/:id/use` - Use template

### Exercises (`/api/exercises/*`)
- `GET /api/exercises/log` - Get exercise logs
- `POST /api/exercises/log` - Log exercise
- `PUT /api/exercises/log/:id` - Update exercise log
- `DELETE /api/exercises/log/:id` - Delete exercise log
- `GET /api/exercises/search` - Search exercises
- `GET /api/exercises/templates` - Get exercise templates
- `GET /api/exercises/categories` - Get exercise categories
- `GET /api/exercises/stats` - Get exercise statistics
- `POST /api/exercises/calculate-calories` - Calculate calories

### Body Metrics (`/api/body-metrics/*`)
- `GET /api/body-metrics` - Get body metrics
- `POST /api/body-metrics` - Log body metrics
- `PUT /api/body-metrics/:id` - Update body metrics
- `DELETE /api/body-metrics/:id` - Delete body metrics
- `GET /api/body-metrics/latest` - Get latest metrics
- `GET /api/body-metrics/stats` - Get statistics
- `GET /api/body-metrics/progress` - Get progress data

### Chat (`/api/chat/*`)
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/messages` - Send message
- `DELETE /api/chat/messages/:id` - Delete message
- `GET /api/chat/suggest` - Get suggestions
- `POST /api/chat/clear` - Clear chat history
- `POST /api/chat/feedback` - Submit feedback
- `GET /api/chat/export` - Export chat history

### Dashboard & Analytics
- `GET /api/dashboard/today` - Today's summary
- `GET /api/analytics/progress` - Progress analytics
- `GET /api/health` - Health check
- `POST /api/upload` - File upload

## Configuration

### Environment Variables

```bash
# Enable/disable mocking (default: true in development)
NEXT_PUBLIC_USE_MOCK_API=true

# API base URL (default: http://localhost:3000/api)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Request timeout in milliseconds (default: 10000)
NEXT_PUBLIC_API_TIMEOUT=10000

# Number of retries for failed requests (default: 3)
NEXT_PUBLIC_API_RETRIES=3
```

### Response Delays

MSW includes realistic response delays:
- Fast: 200ms (simple operations)
- Medium: 500ms (standard operations)
- Slow: 1000ms (complex operations)
- Network: 1500ms (file uploads, AI processing)

## Usage

### Automatic Initialization

MSW is automatically initialized in development mode through the `AppProvider`. No manual setup required.

### Manual Control

```typescript
import { setupMSW, worker, server } from '@/lib/msw'

// Initialize in browser
await setupMSW()

// Access browser worker directly
worker.start()
worker.stop()

// Access Node.js server (for testing)
server.listen()
server.close()
```

### API Service Layer

The application uses a service layer that automatically switches between mock and real APIs based on environment configuration:

```typescript
import { authService } from '@/lib/api/services'

// This will use MSW in development, real API in production
const response = await authService.login({ email, password })
```

## Mock Data

Mock data is sourced from `lib/mockData.ts` and extended with realistic variations. The handlers include:

- User profiles with Japanese localization
- Nutrition data with realistic caloric values
- Exercise templates with MET values
- Food database with JAN codes and nutrition facts
- Chat AI responses in Japanese
- Body metrics with trend simulation

## Error Handling

MSW handlers include comprehensive error scenarios:

- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Conflict errors (409)
- Server errors (500)

## Authentication

Mock authentication uses JWT-like tokens prefixed with `mock-access-token` and `mock-refresh-token`. The handlers validate these tokens and maintain session state.

## Testing Integration

For testing environments:

```typescript
import { server, resetMocking, stopMocking } from '@/lib/msw'

beforeAll(() => server.listen())
afterEach(() => resetMocking())
afterAll(() => stopMocking())
```

## Switching to Real API

To disable mocking and use a real API:

1. Set `NEXT_PUBLIC_USE_MOCK_API=false`
2. Update `NEXT_PUBLIC_API_BASE_URL` to your API server
3. The service layer will automatically use real HTTP requests

## File Structure

- **Handlers**: Each domain (auth, nutrition, etc.) has its own handler file
- **Services**: API service layer abstracts HTTP calls from components
- **Types**: Full TypeScript support with API response types
- **Validation**: Request/response validation with detailed error messages
- **Pagination**: Consistent pagination across list endpoints
- **Filtering**: Search, date range, and category filtering support

## Best Practices

1. Keep handlers focused on single domains
2. Use realistic response delays
3. Include comprehensive error scenarios
4. Validate request data thoroughly
5. Maintain consistent API response formats
6. Use TypeScript for type safety
7. Test both success and error paths