// React Query hooks usage examples
// This file demonstrates how to use the React Query hooks effectively

import React from 'react'
import { 
  useCurrentUser,
  useLogin,
  useDailyNutrition,
  useNutritionGoals,
  useLogMeal,
  useSearchFoods,
  useSendMessage,
  useLatestBodyMetrics,
  useDailyExercises,
} from './hooks'

// Example 1: Authentication Flow
export function AuthExample() {
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const loginMutation = useLogin()

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password })
      // User will be automatically refetched due to cache invalidation
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (userLoading) {
    return <div>Loading user...</div>
  }

  if (!user) {
    return (
      <button 
        onClick={() => handleLogin('test@example.com', 'password')}
        disabled={loginMutation.isLoading}
      >
        {loginMutation.isLoading ? 'Logging in...' : 'Login'}
      </button>
    )
  }

  return <div>Welcome, {user.email}!</div>
}

// Example 2: Nutrition Dashboard with Real-time Updates
export function NutritionDashboard() {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: dailyNutrition, isLoading: nutritionLoading } = useDailyNutrition(today)
  const { data: goals, isLoading: goalsLoading } = useNutritionGoals()

  if (nutritionLoading || goalsLoading) {
    return <div>Loading nutrition data...</div>
  }

  const progress = goals && dailyNutrition ? {
    calories: (dailyNutrition.caloriesKcal / goals.caloriesKcal) * 100,
    protein: (dailyNutrition.proteinG / goals.proteinG) * 100,
    carbs: (dailyNutrition.carbG / goals.carbG) * 100,
    fat: (dailyNutrition.fatG / goals.fatG) * 100,
  } : null

  return (
    <div className="nutrition-dashboard">
      <h2>Today&apos;s Nutrition</h2>
      {progress && (
        <div>
          <div>Calories: {dailyNutrition?.caloriesKcal}/{goals?.caloriesKcal} ({Math.round(progress.calories)}%)</div>
          <div>Protein: {dailyNutrition?.proteinG}g/{goals?.proteinG}g ({Math.round(progress.protein)}%)</div>
          <div>Carbs: {dailyNutrition?.carbG}g/{goals?.carbG}g ({Math.round(progress.carbs)}%)</div>
          <div>Fat: {dailyNutrition?.fatG}g/{goals?.fatG}g ({Math.round(progress.fat)}%)</div>
        </div>
      )}
    </div>
  )
}

// Example 3: Meal Logging with Optimistic Updates
export function MealLogging() {
  const today = new Date().toISOString().split('T')[0]
  const [searchQuery, setSearchQuery] = React.useState('')
  
  const { data: searchResults, isLoading: searchLoading } = useSearchFoods({
    q: searchQuery,
    limit: 10,
  })
  
  const logMealMutation = useLogMeal()

  const handleLogMeal = async (foodId: string, quantity: number) => {
    try {
      await logMealMutation.mutateAsync({
        mealType: 'lunch',
        loggedAt: new Date(),
        items: [{
          foodId,
          foodName: 'Selected Food',
          quantity,
          unit: 'g',
          calories: 100, // This would come from the food data
          proteinG: 10,
          fatG: 5,
          carbG: 15,
          fiberG: 2,
          order: 0,
          confidence: 1.0,
        }],
        source: 'manual',
        aiEstimated: false,
        notes: '',
      })
    } catch (error) {
      console.error('Failed to log meal:', error)
    }
  }

  return (
    <div className="meal-logging">
      <h2>Log a Meal</h2>
      
      <input
        type="text"
        placeholder="Search for food..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {searchLoading && <div>Searching...</div>}
      
      {searchResults && (
        <div className="search-results">
          {searchResults.items.map((food) => (
            <div key={food.id} className="food-item">
              <span>{food.name}</span>
              <button
                onClick={() => handleLogMeal(food.id, 100)}
                disabled={logMealMutation.isLoading}
              >
                {logMealMutation.isLoading ? 'Adding...' : 'Add to Meal'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Example 4: Chat Interface with Streaming
export function ChatInterface() {
  const [message, setMessage] = React.useState('')
  
  const { data: messages, isLoading } = useChatMessages({ limit: 50 })
  const sendMessageMutation = useSendMessage()

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    try {
      await sendMessageMutation.mutateAsync({
        content: message,
        context: { source: 'nutrition_chat' },
      })
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (isLoading) {
    return <div>Loading chat...</div>
  }

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages?.items.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about nutrition, exercise, or health..."
        />
        <button
          onClick={handleSendMessage}
          disabled={sendMessageMutation.isLoading || !message.trim()}
        >
          {sendMessageMutation.isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

// Example 5: Body Metrics Tracking with Trends
export function BodyMetricsTracker() {
  const { data: latestMetrics } = useLatestBodyMetrics()
  const { data: trends } = useBodyMetricsTrends('weight', '30d')

  return (
    <div className="body-metrics">
      <h2>Body Metrics</h2>
      
      {latestMetrics && (
        <div className="current-metrics">
          <h3>Latest Measurement</h3>
          <div>Weight: {latestMetrics.weightKg}kg</div>
          <div>Body Fat: {latestMetrics.bodyFatPct}%</div>
          <div>Date: {new Date(latestMetrics.measurementDate).toLocaleDateString()}</div>
        </div>
      )}
      
      {trends && (
        <div className="trends">
          <h3>Weight Trend (30 days)</h3>
          <div>Trend: {trends.trend}</div>
          <div>Change Rate: {trends.changeRate}kg/week</div>
        </div>
      )}
    </div>
  )
}

// Example 6: Comprehensive Dashboard
export function HealthDashboard() {
  const today = new Date().toISOString().split('T')[0]
  
  // Fetch all data in parallel
  const { data: user } = useCurrentUser()
  const { data: dailyNutrition } = useDailyNutrition(today)
  const { data: exercises } = useDailyExercises(today)
  const { data: bodyMetrics } = useLatestBodyMetrics()

  return (
    <div className="health-dashboard">
      <h1>Health Dashboard</h1>
      
      {user && (
        <div className="user-section">
          <h2>Welcome, {user.profile?.displayName || user.email}</h2>
        </div>
      )}
      
      <div className="dashboard-grid">
        <div className="nutrition-card">
          <h3>Today&apos;s Nutrition</h3>
          {dailyNutrition ? (
            <div>
              <div>Calories: {dailyNutrition.caloriesKcal}</div>
              <div>Protein: {dailyNutrition.proteinG}g</div>
            </div>
          ) : (
            <div>No nutrition data for today</div>
          )}
        </div>
        
        <div className="exercise-card">
          <h3>Today&apos;s Exercise</h3>
          {exercises && exercises.length > 0 ? (
            <div>
              <div>{exercises.length} exercise(s) logged</div>
              <div>
                Total Duration: {exercises.reduce((sum, ex) => sum + ex.durationMin, 0)} minutes
              </div>
            </div>
          ) : (
            <div>No exercises logged today</div>
          )}
        </div>
        
        <div className="body-metrics-card">
          <h3>Latest Measurements</h3>
          {bodyMetrics ? (
            <div>
              <div>Weight: {bodyMetrics.weightKg}kg</div>
              <div>Body Fat: {bodyMetrics.bodyFatPct}%</div>
            </div>
          ) : (
            <div>No recent measurements</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Example 7: Error Handling and Loading States
export function RobustDataComponent() {
  const { 
    data: nutrition, 
    error, 
    isLoading, 
    isError, 
    refetch 
  } = useDailyNutrition(new Date().toISOString().split('T')[0])

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div>Loading nutrition data...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="error-state">
        <div>Failed to load nutrition data</div>
        <div>{error?.message}</div>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    )
  }

  if (!nutrition) {
    return (
      <div className="empty-state">
        <div>No nutrition data available for today</div>
        <div>Start by logging your first meal!</div>
      </div>
    )
  }

  return (
    <div className="nutrition-data">
      <h3>Today&apos;s Nutrition</h3>
      <div>Calories: {nutrition.caloriesKcal}</div>
      <div>Protein: {nutrition.proteinG}g</div>
      <div>Carbs: {nutrition.carbG}g</div>
      <div>Fat: {nutrition.fatG}g</div>
    </div>
  )
}

// Example 8: Custom Hook for Complex Logic
export function useNutritionInsights(date: string) {
  const { data: nutrition } = useDailyNutrition(date)
  const { data: goals } = useNutritionGoals()
  
  return React.useMemo(() => {
    if (!nutrition || !goals) return null
    
    const calorieProgress = (nutrition.caloriesKcal / goals.caloriesKcal) * 100
    const proteinProgress = (nutrition.proteinG / goals.proteinG) * 100
    
    const insights = []
    
    if (calorieProgress > 110) {
      insights.push('You\'ve exceeded your calorie goal for today')
    } else if (calorieProgress < 80) {
      insights.push('You\'re under your calorie goal - consider adding a healthy snack')
    }
    
    if (proteinProgress < 70) {
      insights.push('Your protein intake is low - try adding lean protein to your next meal')
    }
    
    return {
      calorieProgress,
      proteinProgress,
      insights,
      isOnTrack: calorieProgress >= 90 && calorieProgress <= 110 && proteinProgress >= 80,
    }
  }, [nutrition, goals])
}