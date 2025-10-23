import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NutritionGoals, DailyNutrition, NutrientType } from '../types';

interface NutritionStore {
  // State
  nutritionGoals: NutritionGoals | null;
  dailyNutrition: DailyNutrition[];
  currentDateNutrition: DailyNutrition | null;
  loading: boolean;
  error: string | null;

  // Actions
  setNutritionGoals: (goals: NutritionGoals) => Promise<void>;
  updateNutritionGoals: (updates: Partial<NutritionGoals>) => Promise<void>;
  fetchDailyNutrition: (date: Date) => Promise<void>;
  fetchNutritionHistory: (startDate: Date, endDate: Date) => Promise<void>;
  updateDailyNutrition: (nutrition: Partial<DailyNutrition>) => void;
  calculateRemainingNutrients: () => Partial<Record<NutrientType, number>>;
  calculateNutrientPercentages: () => Partial<Record<NutrientType, number>>;
  resetDailyNutrition: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      nutritionGoals: null,
      dailyNutrition: [],
      currentDateNutrition: null,
      loading: false,
      error: null,

      // Actions
      setNutritionGoals: async (goals: NutritionGoals) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({
            nutritionGoals: goals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to set nutrition goals'
          });
        }
      },

      updateNutritionGoals: async (updates: Partial<NutritionGoals>) => {
        set({ loading: true, error: null });
        try {
          const currentGoals = get().nutritionGoals;
          if (!currentGoals) throw new Error('No nutrition goals set');

          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedGoals: NutritionGoals = {
            ...currentGoals,
            ...updates,
            updatedAt: new Date()
          };

          set({
            nutritionGoals: updatedGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update nutrition goals'
          });
        }
      },

      fetchDailyNutrition: async (date: Date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock data for current date
          const mockDailyNutrition: DailyNutrition = {
            id: `daily-${date.toISOString()}`,
            userId: '1',
            date,
            totalNutrients: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0,
              saturatedFat: 0,
              cholesterol: 0
            },
            meals: [],
            waterIntake: 0,
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          set({
            currentDateNutrition: mockDailyNutrition,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch daily nutrition'
          });
        }
      },

      fetchNutritionHistory: async (startDate: Date, endDate: Date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock data for date range
          const mockHistory: DailyNutrition[] = [];
          const currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            mockHistory.push({
              id: `daily-${currentDate.toISOString()}`,
              userId: '1',
              date: new Date(currentDate),
              totalNutrients: {
                calories: Math.random() * 500 + 1500,
                protein: Math.random() * 30 + 50,
                carbs: Math.random() * 50 + 150,
                fat: Math.random() * 20 + 50,
                fiber: Math.random() * 10 + 15,
                sugar: Math.random() * 20 + 30,
                sodium: Math.random() * 500 + 1500,
                saturatedFat: Math.random() * 10 + 10,
                cholesterol: Math.random() * 100 + 200
              },
              meals: [],
              waterIntake: Math.random() * 1000 + 2000,
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }

          set({
            dailyNutrition: mockHistory,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch nutrition history'
          });
        }
      },

      updateDailyNutrition: (nutrition: Partial<DailyNutrition>) => {
        const current = get().currentDateNutrition;
        if (!current) return;

        const updated: DailyNutrition = {
          ...current,
          ...nutrition,
          totalNutrients: nutrition.totalNutrients
            ? { ...current.totalNutrients, ...nutrition.totalNutrients }
            : current.totalNutrients,
          updatedAt: new Date()
        };

        set({ currentDateNutrition: updated });
      },

      calculateRemainingNutrients: () => {
        const goals = get().nutritionGoals;
        const current = get().currentDateNutrition;
        
        if (!goals || !current) return {};

        const remaining: Partial<Record<NutrientType, number>> = {};
        
        (Object.keys(goals.dailyTargets) as NutrientType[]).forEach(nutrient => {
          const target = goals.dailyTargets[nutrient];
          const consumed = current.totalNutrients[nutrient] || 0;
          remaining[nutrient] = Math.max(0, target - consumed);
        });

        return remaining;
      },

      calculateNutrientPercentages: () => {
        const goals = get().nutritionGoals;
        const current = get().currentDateNutrition;
        
        if (!goals || !current) return {};

        const percentages: Partial<Record<NutrientType, number>> = {};
        
        (Object.keys(goals.dailyTargets) as NutrientType[]).forEach(nutrient => {
          const target = goals.dailyTargets[nutrient];
          const consumed = current.totalNutrients[nutrient] || 0;
          percentages[nutrient] = target > 0 ? (consumed / target) * 100 : 0;
        });

        return percentages;
      },

      resetDailyNutrition: () => {
        const current = get().currentDateNutrition;
        if (!current) return;

        set({
          currentDateNutrition: {
            ...current,
            totalNutrients: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0,
              saturatedFat: 0,
              cholesterol: 0
            },
            meals: [],
            waterIntake: 0,
            notes: '',
            updatedAt: new Date()
          }
        });
      },

      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'nutrition-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nutritionGoals: state.nutritionGoals,
        currentDateNutrition: state.currentDateNutrition
      })
    }
  )
);