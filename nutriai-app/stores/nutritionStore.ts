import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DailyNutrition, NutritionGoals } from '../types/nutrition'
import { nutritionService } from '../lib/api/services/nutrition'

interface NutritionStoreState {
  dailyNutrition: DailyNutrition | null
  goals: NutritionGoals | null
  loading: boolean
  error: string | null
  fetchDailyNutrition: (date: string) => Promise<void>
  fetchGoals: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useNutritionStore = create<NutritionStoreState>()(
  persist(
    (set) => ({
      dailyNutrition: null,
      goals: null,
      loading: false,
      error: null,

      fetchDailyNutrition: async (date: string) => {
        set({ loading: true, error: null })
        try {
          const nutrition = await nutritionService.getDailyNutrition(date)
          set({ dailyNutrition: nutrition, loading: false, error: null })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch daily nutrition',
          })
        }
      },

      fetchGoals: async () => {
        set({ loading: true, error: null })
        try {
          const goals = await nutritionService.getGoals()
          set({ goals, loading: false, error: null })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch nutrition goals',
          })
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'nutrition-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dailyNutrition: state.dailyNutrition,
        goals: state.goals,
      }),
    },
  ),
)
