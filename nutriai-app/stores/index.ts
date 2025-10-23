// Store exports
export { useAuthStore } from './authStore';
export { useNutritionStore } from './nutritionStore';
export { useMealStore } from './mealStore';
export { useExerciseStore } from './exerciseStore';
export { useBodyMetricsStore } from './bodyMetricsStore';
export { useChatStore } from './chatStore';
export { useUIStore } from './uiStore';

// Types
export type { Notification, LoadingState, ModalState } from './uiStore';

// Store utilities and hooks
import { useAuthStore } from './authStore';
import { useNutritionStore } from './nutritionStore';
import { useMealStore } from './mealStore';
import { useExerciseStore } from './exerciseStore';
import { useBodyMetricsStore } from './bodyMetricsStore';
import { useChatStore } from './chatStore';
import { useUIStore } from './uiStore';

// Combined store state type for TypeScript
export interface RootStoreState {
  auth: ReturnType<typeof useAuthStore.getState>;
  nutrition: ReturnType<typeof useNutritionStore.getState>;
  meal: ReturnType<typeof useMealStore.getState>;
  exercise: ReturnType<typeof useExerciseStore.getState>;
  bodyMetrics: ReturnType<typeof useBodyMetricsStore.getState>;
  chat: ReturnType<typeof useChatStore.getState>;
  ui: ReturnType<typeof useUIStore.getState>;
}

// Store initialization hook
export const useStoreInitialization = () => {
  const authStore = useAuthStore();
  const nutritionStore = useNutritionStore();
  const mealStore = useMealStore();
  const exerciseStore = useExerciseStore();
  const bodyMetricsStore = useBodyMetricsStore();
  const chatStore = useChatStore();
  const uiStore = useUIStore();

  const initializeStores = async () => {
    try {
      // Initialize auth first
      if (authStore.token) {
        await authStore.checkAuth();
      }

      // If authenticated, initialize other stores
      if (authStore.isAuthenticated) {
        const initPromises = [
          nutritionStore.fetchDailyNutrition(new Date()),
          mealStore.fetchMeals(new Date()),
          mealStore.fetchMealTemplates(),
          exerciseStore.fetchExercises(),
          exerciseStore.fetchSessions(new Date()),
          exerciseStore.fetchExerciseGoals(),
          bodyMetricsStore.fetchLatestMetrics(),
          bodyMetricsStore.fetchMetricsGoals(),
          chatStore.fetchSessions()
        ];

        await Promise.allSettled(initPromises);
      }
    } catch (error) {
      console.error('Store initialization error:', error);
      uiStore.showError('Initialization Error', 'Failed to load some data. Please refresh the page.');
    }
  };

  return {
    initializeStores,
    isInitialized: authStore.isAuthenticated
  };
};

// Store action aggregators for common operations
export const useStoreActions = () => {
  const authStore = useAuthStore();
  const nutritionStore = useNutritionStore();
  const mealStore = useMealStore();
  const exerciseStore = useExerciseStore();
  const bodyMetricsStore = useBodyMetricsStore();
  const chatStore = useChatStore();
  const uiStore = useUIStore();

  // Combined actions for complex operations
  const logMealAndUpdateNutrition = async (meal: any) => {
    try {
      uiStore.setGlobalLoading(true);
      
      // Add meal
      await mealStore.addMeal(meal);
      
      // Update daily nutrition
      const totalNutrients = mealStore.calculateMealNutrients(meal.foods);
      const previousNutrients = nutritionStore.currentDateNutrition?.totalNutrients ?? {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        saturatedFat: 0,
        cholesterol: 0,
      };
      nutritionStore.updateDailyNutrition({
        totalNutrients: {
          calories: previousNutrients.calories + (totalNutrients.calories ?? 0),
          protein: previousNutrients.protein + (totalNutrients.protein ?? 0),
          carbs: previousNutrients.carbs + (totalNutrients.carbs ?? 0),
          fat: previousNutrients.fat + (totalNutrients.fat ?? 0),
          fiber: previousNutrients.fiber + (totalNutrients.fiber ?? 0),
          sugar: previousNutrients.sugar + (totalNutrients.sugar ?? 0),
          sodium: previousNutrients.sodium + (totalNutrients.sodium ?? 0),
          saturatedFat: previousNutrients.saturatedFat,
          cholesterol: previousNutrients.cholesterol,
        },
      });

      uiStore.showSuccess('Meal Logged', 'Your meal has been successfully logged and nutrition updated.');
    } catch (error) {
      uiStore.showError('Error', 'Failed to log meal. Please try again.');
    } finally {
      uiStore.setGlobalLoading(false);
    }
  };

  const completeWorkoutAndUpdateMetrics = async (session: any, caloriesBurned: number) => {
    try {
      uiStore.setGlobalLoading(true);
      
      // End exercise session
      await exerciseStore.endSession(session.id);
      
      // Update nutrition with burned calories (negative calories)
      const previousNutrients = nutritionStore.currentDateNutrition?.totalNutrients ?? {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        saturatedFat: 0,
        cholesterol: 0,
      };
      nutritionStore.updateDailyNutrition({
        totalNutrients: {
          ...previousNutrients,
          calories: previousNutrients.calories - caloriesBurned,
        },
      });

      uiStore.showSuccess('Workout Complete', `Great job! You burned ${caloriesBurned} calories.`);
    } catch (error) {
      uiStore.showError('Error', 'Failed to complete workout. Please try again.');
    } finally {
      uiStore.setGlobalLoading(false);
    }
  };

  const updateBodyMetricsAndGoals = async (metrics: any) => {
    try {
      uiStore.setGlobalLoading(true);
      
      // Add new metrics
      await bodyMetricsStore.addMetrics(metrics);
      
      // Check if goals are met and update progress
      const goals = bodyMetricsStore.metricsGoals.filter(g => g.isActive);
      goals.forEach(goal => {
        const progress = bodyMetricsStore.getMetricProgress('weight');
        if (progress && progress.percentage >= 100) {
          uiStore.showSuccess('Goal Achieved!', 'Congratulations on reaching your weight goal!');
        }
      });

    } catch (error) {
      uiStore.showError('Error', 'Failed to update body metrics. Please try again.');
    } finally {
      uiStore.setGlobalLoading(false);
    }
  };

  const logoutAndClearStores = async () => {
    try {
      // Clear all store data
      authStore.logout();
      nutritionStore.resetDailyNutrition();
      mealStore.setSelectedMeal(null);
      exerciseStore.setSelectedSession(null);
      chatStore.setCurrentSession(null);
      uiStore.clearNotifications();
      uiStore.closeAllModals();
      
      uiStore.showInfo('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      uiStore.showError('Error', 'An error occurred during logout.');
    }
  };

  return {
    logMealAndUpdateNutrition,
    completeWorkoutAndUpdateMetrics,
    updateBodyMetricsAndGoals,
    logoutAndClearStores
  };
};

// Store selectors for computed values
export const useStoreSelectors = () => {
  const authStore = useAuthStore();
  const nutritionStore = useNutritionStore();
  const mealStore = useMealStore();
  const exerciseStore = useExerciseStore();
  const bodyMetricsStore = useBodyMetricsStore();
  const chatStore = useChatStore();
  const uiStore = useUIStore();

  // Computed values
  const dashboardData = {
    isAuthenticated: authStore.isAuthenticated,
    userName: authStore.user?.profile?.displayName || authStore.user?.email || 'User',
    todaysCalories: nutritionStore.currentDateNutrition?.totalNutrients.calories || 0,
    calorieGoal: nutritionStore.nutritionGoals?.dailyTargets.calories || 2000,
    todaysMeals: mealStore.todaysMeals.length,
    todaysWorkouts: exerciseStore.todaysSessions.length,
    currentWeight: bodyMetricsStore.currentMetrics?.weight || 0,
    weightGoal: bodyMetricsStore.metricsGoals.find(g => g.isActive)?.targetMetrics.weight || 0,
    hasUnreadMessages: chatStore.sessions.some(s => s.lastMessageAt > new Date(Date.now() - 86400000)),
    loadingCount: uiStore.loadingStates.length,
    notificationCount: uiStore.notifications.length
  };

  const progressData = {
    nutritionProgress: nutritionStore.calculateNutrientPercentages(),
    weeklyExerciseProgress: exerciseStore.calculateWeeklyProgress(),
    weightTrend: bodyMetricsStore.getMetricTrend('weight'),
    bodyFatTrend: bodyMetricsStore.getMetricTrend('bodyFat'),
    goalProgress: {
      weight: bodyMetricsStore.getMetricProgress('weight'),
      bodyFat: bodyMetricsStore.getMetricProgress('bodyFat'),
      exercise: exerciseStore.exerciseGoals.find(g => g.isActive)
    }
  };

  return {
    dashboardData,
    progressData
  };
};

// Error boundary for store errors
export const handleStoreError = (error: Error, storeName: string) => {
  console.error(`${storeName} store error:`, error);
  
  const uiStore = useUIStore.getState();
  uiStore.showError(
    'Application Error',
    `An error occurred in ${storeName}. Please try refreshing the page.`
  );
};

// Store persistence management
export const clearAllStoreData = () => {
  const stores = [
    'auth-storage',
    'nutrition-storage',
    'meal-storage',
    'exercise-storage',
    'body-metrics-storage',
    'chat-storage',
    'ui-storage'
  ];

  stores.forEach(storeKey => {
    localStorage.removeItem(storeKey);
  });
};

export const exportStoreData = () => {
  const data = {
    auth: useAuthStore.getState(),
    nutrition: useNutritionStore.getState(),
    meal: useMealStore.getState(),
    exercise: useExerciseStore.getState(),
    bodyMetrics: useBodyMetricsStore.getState(),
    chat: useChatStore.getState(),
    ui: useUIStore.getState(),
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(data, null, 2);
};
