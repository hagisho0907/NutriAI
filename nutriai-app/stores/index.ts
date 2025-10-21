// Central export barrel for Zustand stores
export { useAuthStore } from './authStore'
export { useNutritionStore } from './nutritionStore'
export { useMealStore } from './mealStore'
export { useExerciseStore } from './exerciseStore'
export { useBodyMetricsStore } from './bodyMetricsStore'
export { useChatStore } from './chatStore'
export { useUIStore } from './uiStore'

export type { Notification, LoadingState, ModalState } from './uiStore'
