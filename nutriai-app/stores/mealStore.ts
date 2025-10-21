import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Meal, MealTemplate } from '../types/meal'

interface MealStoreState {
  meals: Meal[]
  templates: MealTemplate[]
  loading: boolean
  error: string | null
  fetchMeals: (date: string) => Promise<void>
  fetchMealTemplates: () => Promise<void>
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const mockMeal = (date: string): Meal => ({
  id: `meal-${date}`,
  userId: 'mock-user',
  loggedAt: `${date}T12:00:00Z`,
  mealType: 'lunch',
  source: 'manual',
  aiEstimated: false,
  items: [],
  totalCalories: 600,
  totalProteinG: 35,
  totalFatG: 20,
  totalCarbG: 65,
  createdAt: new Date().toISOString(),
})

const mockTemplate = (id: string, name: string): MealTemplate => ({
  id,
  userId: 'mock-user',
  name,
  foods: [],
  totalNutrition: {
    calories: 550,
    proteinG: 30,
    fatG: 18,
    carbG: 60,
  },
  instructions: 'Enjoy this sample template',
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const useMealStore = create<MealStoreState>()(
  persist(
    (set, get) => ({
      meals: [],
      templates: [],
      loading: false,
      error: null,

      fetchMeals: async (date: string) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          set({
            meals: [mockMeal(date)],
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch meals',
          })
        }
      },

      fetchMealTemplates: async () => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          set({
            templates: [mockTemplate('template-1', 'Balanced Lunch')],
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch meal templates',
          })
        }
      },

      addMeal: async (meal) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          const newMeal: Meal = {
            ...meal,
            id: `meal-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          set({
            meals: [...get().meals, newMeal],
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add meal',
          })
        }
      },

      deleteMeal: async (id) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 100))
          set({
            meals: get().meals.filter((meal) => meal.id !== id),
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete meal',
          })
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'meal-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ meals: state.meals, templates: state.templates }),
    },
  ),
)
