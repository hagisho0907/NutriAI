import React, { useEffect, useState } from 'react';
import {
  useAuthStore,
  useNutritionStore,
  useMealStore,
  useExerciseStore,
  useBodyMetricsStore,
  useChatStore,
  useUIStore,
  useStoreActions,
  useStoreSelectors
} from './index';

// Example 1: Authentication Component
export const AuthExample: React.FC = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuthStore();
  const { showSuccess, showError } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const displayName = user?.profile?.displayName ?? user?.email ?? '';
      showSuccess('Login Successful', `Welcome back, ${displayName}!`);
    } catch (error) {
      showError('Login Failed', 'Please check your credentials and try again.');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="p-4">
        <h2>Welcome, {user?.profile?.displayName ?? user?.email ?? 'Guest'}!</h2>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

// Example 2: Nutrition Dashboard
export const NutritionDashboard: React.FC = () => {
  const { 
    currentDateNutrition, 
    nutritionGoals, 
    fetchDailyNutrition,
    calculateNutrientPercentages,
    calculateRemainingNutrients
  } = useNutritionStore();
  const { todaysMeals } = useMealStore();

  useEffect(() => {
    fetchDailyNutrition(new Date());
  }, [fetchDailyNutrition]);

  const percentages = calculateNutrientPercentages();
  const remaining = calculateRemainingNutrients();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Today's Nutrition</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Calories</h3>
          <p className="text-2xl">
            {currentDateNutrition?.totalNutrients.calories.toFixed(0) || 0}
          </p>
          <p className="text-sm text-gray-600">
            Goal: {nutritionGoals?.dailyTargets.calories || 0}
          </p>
          <div className="w-full bg-gray-200 rounded h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${Math.min(100, (percentages.calories || 0))}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Meals Today</h3>
          <p className="text-2xl">{todaysMeals.length}</p>
          <p className="text-sm text-gray-600">
            {remaining.calories ? `${remaining.calories.toFixed(0)} cal remaining` : 'Goal reached!'}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Macronutrients</h3>
        <div className="space-y-2">
          {['protein', 'carbs', 'fat'].map((nutrient) => (
            <div key={nutrient} className="flex items-center space-x-4">
              <span className="w-20 capitalize">{nutrient}</span>
              <div className="flex-1 bg-gray-200 rounded h-2">
                <div 
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${Math.min(100, (percentages[nutrient as keyof typeof percentages] || 0))}%` }}
                />
              </div>
              <span className="text-sm">
                {((currentDateNutrition?.totalNutrients[nutrient as keyof typeof currentDateNutrition.totalNutrients] || 0)).toFixed(1)}g
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example 3: Meal Logging
export const MealLogging: React.FC = () => {
  const { addMeal, todaysMeals, loading } = useMealStore();
  const { logMealAndUpdateNutrition } = useStoreActions();
  const { showSuccess } = useUIStore();
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    const mealData = {
      userId: '1',
      name: mealName,
      type: mealType,
      foods: [],
      totalNutrients: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      },
      date: new Date(),
      time: new Date().toTimeString().slice(0, 5),
      notes: ''
    };

    await logMealAndUpdateNutrition(mealData);
    setMealName('');
    showSuccess('Meal Added', 'Your meal has been logged successfully!');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Log Meal</h2>
      
      <form onSubmit={handleAddMeal} className="space-y-4">
        <input
          type="text"
          placeholder="Meal name"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as any)}
          className="w-full p-2 border rounded"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Meal'}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Today's Meals</h3>
        {todaysMeals.map((meal) => (
          <div key={meal.id} className="bg-white p-3 rounded shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{meal.name}</span>
                <span className="text-sm text-gray-600 ml-2 capitalize">({meal.type})</span>
              </div>
              <span className="text-sm text-gray-500">{meal.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 4: Dashboard with Combined Store Data
export const Dashboard: React.FC = () => {
  const { dashboardData } = useStoreSelectors();
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, {dashboardData.userName}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-medium text-gray-600">Today's Calories</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dashboardData.todaysCalories.toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">
            Goal: {dashboardData.calorieGoal}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-medium text-gray-600">Meals Today</h3>
          <p className="text-2xl font-bold text-green-600">
            {dashboardData.todaysMeals}
          </p>
          <p className="text-sm text-gray-500">meals logged</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-medium text-gray-600">Workouts Today</h3>
          <p className="text-2xl font-bold text-purple-600">
            {dashboardData.todaysWorkouts}
          </p>
          <p className="text-sm text-gray-500">sessions completed</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-medium text-gray-600">Current Weight</h3>
          <p className="text-2xl font-bold text-orange-600">
            {dashboardData.currentWeight.toFixed(1)} kg
          </p>
          <p className="text-sm text-gray-500">
            Goal: {dashboardData.weightGoal} kg
          </p>
        </div>
      </div>

      {dashboardData.loadingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-blue-800">
            Loading data... ({dashboardData.loadingCount} operations in progress)
          </p>
        </div>
      )}
    </div>
  );
};

// Example 5: Exercise Tracking
export const ExerciseTracker: React.FC = () => {
  const { 
    todaysSessions, 
    selectedSession, 
    startSession, 
    endSession, 
    fetchSessions 
  } = useExerciseStore();
  const { completeWorkoutAndUpdateMetrics } = useStoreActions();
  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    fetchSessions(new Date());
  }, [fetchSessions]);

  const handleStartSession = async () => {
    if (!sessionName.trim()) return;
    await startSession(sessionName);
    setSessionName('');
  };

  const handleEndSession = async () => {
    if (!selectedSession) return;
    const caloriesBurned = 250; // Mock value
    await completeWorkoutAndUpdateMetrics(selectedSession, caloriesBurned);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Exercise Tracker</h2>
      
      {!selectedSession ? (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Workout name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleStartSession}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Start Workout
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="text-lg font-semibold text-green-800">
            Active Session: {selectedSession.name}
          </h3>
          <p className="text-green-600">Started at {selectedSession.startTime}</p>
          <button
            onClick={handleEndSession}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            End Workout
          </button>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Today's Sessions</h3>
        {todaysSessions.map((session) => (
          <div key={session.id} className="bg-white p-3 rounded shadow">
            <div className="flex justify-between items-center">
              <span className="font-medium">{session.name}</span>
              <span className="text-sm text-gray-500">
                {session.duration} min • {session.totalCaloriesBurned} cal
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 6: UI State Management
export const NotificationExample: React.FC = () => {
  const { 
    notifications, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    removeNotification
  } = useUIStore();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Notifications</h2>
      
      <div className="flex space-x-2">
        <button
          onClick={() => showSuccess('Success!', 'This is a success message')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Success
        </button>
        <button
          onClick={() => showError('Error!', 'This is an error message')}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Error
        </button>
        <button
          onClick={() => showWarning('Warning!', 'This is a warning message')}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Warning
        </button>
        <button
          onClick={() => showInfo('Info!', 'This is an info message')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Info
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Active Notifications</h3>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded border-l-4 ${
              notification.type === 'success' ? 'bg-green-50 border-green-500' :
              notification.type === 'error' ? 'bg-red-50 border-red-500' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm text-gray-600">{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
