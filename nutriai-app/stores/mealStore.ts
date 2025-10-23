import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Meal, MealTemplate, MealType, Food } from '../types';

interface MealStore {
  // State
  meals: Meal[];
  todaysMeals: Meal[];
  mealTemplates: MealTemplate[];
  selectedMeal: Meal | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchMeals: (date: Date) => Promise<void>;
  fetchMealHistory: (startDate: Date, endDate: Date) => Promise<void>;
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  duplicateMeal: (mealId: string, targetDate: Date) => Promise<void>;
  
  // Template actions
  fetchMealTemplates: () => Promise<void>;
  saveMealTemplate: (template: Omit<MealTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMealTemplate: (id: string, updates: Partial<MealTemplate>) => Promise<void>;
  deleteMealTemplate: (id: string) => Promise<void>;
  applyMealTemplate: (templateId: string, date: Date, mealType: MealType) => Promise<void>;
  
  // Food management
  addFoodToMeal: (mealId: string, food: Food) => Promise<void>;
  removeFoodFromMeal: (mealId: string, foodId: string) => Promise<void>;
  updateFoodQuantity: (mealId: string, foodId: string, quantity: number) => Promise<void>;
  
  // Utility actions
  calculateMealNutrients: (foods: Food[]) => Record<string, number>;
  getMealsByType: (type: MealType) => Meal[];
  setSelectedMeal: (meal: Meal | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      // Initial state
      meals: [],
      todaysMeals: [],
      mealTemplates: [],
      selectedMeal: null,
      loading: false,
      error: null,

      // Actions
      fetchMeals: async (date: Date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock data for the date
          const mockMeals: Meal[] = [
            {
              id: '1',
              userId: '1',
              name: 'Breakfast',
              type: 'breakfast',
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
              date,
              time: '08:00',
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          set({
            todaysMeals: mockMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch meals'
          });
        }
      },

      fetchMealHistory: async (startDate: Date, endDate: Date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock data for date range
          const mockMeals: Meal[] = [];
          const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
          const currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            mealTypes.forEach(type => {
              mockMeals.push({
                id: `meal-${currentDate.toISOString()}-${type}`,
                userId: '1',
                name: type.charAt(0).toUpperCase() + type.slice(1),
                type,
                foods: [],
                totalNutrients: {
                  calories: Math.random() * 300 + 200,
                  protein: Math.random() * 20 + 10,
                  carbs: Math.random() * 40 + 20,
                  fat: Math.random() * 15 + 5,
                  fiber: Math.random() * 5 + 2,
                  sugar: Math.random() * 10 + 5,
                  sodium: Math.random() * 300 + 100
                },
                date: new Date(currentDate),
                time: type === 'breakfast' ? '08:00' : type === 'lunch' ? '12:00' : type === 'dinner' ? '18:00' : '15:00',
                notes: '',
                createdAt: new Date(),
                updatedAt: new Date()
              });
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }

          set({
            meals: mockMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch meal history'
          });
        }
      },

      addMeal: async (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newMeal: Meal = {
            ...meal,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const todaysMeals = [...get().todaysMeals, newMeal];
          set({
            todaysMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to add meal'
          });
        }
      },

      updateMeal: async (id: string, updates: Partial<Meal>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const todaysMeals = get().todaysMeals.map(meal =>
            meal.id === id
              ? { ...meal, ...updates, updatedAt: new Date() }
              : meal
          );

          set({
            todaysMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update meal'
          });
        }
      },

      deleteMeal: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const todaysMeals = get().todaysMeals.filter(meal => meal.id !== id);
          set({
            todaysMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete meal'
          });
        }
      },

      duplicateMeal: async (mealId: string, targetDate: Date) => {
        set({ loading: true, error: null });
        try {
          const mealToDuplicate = get().meals.find(m => m.id === mealId) || 
                                  get().todaysMeals.find(m => m.id === mealId);
          
          if (!mealToDuplicate) throw new Error('Meal not found');

          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const duplicatedMeal: Meal = {
            ...mealToDuplicate,
            id: Date.now().toString(),
            date: targetDate,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          if (targetDate.toDateString() === new Date().toDateString()) {
            const todaysMeals = [...get().todaysMeals, duplicatedMeal];
            set({ todaysMeals });
          }

          set({ loading: false, error: null });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to duplicate meal'
          });
        }
      },

      fetchMealTemplates: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock meal templates
          const mockTemplates: MealTemplate[] = [
            {
              id: '1',
              userId: '1',
              name: 'High Protein Breakfast',
              description: 'Eggs, greek yogurt, and toast',
              foods: [],
              totalNutrients: {
                calories: 450,
                protein: 35,
                carbs: 40,
                fat: 15,
                fiber: 5,
                sugar: 10,
                sodium: 400
              },
              tags: ['high-protein', 'breakfast'],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '2',
              userId: '1',
              name: 'Quick Lunch',
              description: 'Chicken salad with whole grain bread',
              foods: [],
              totalNutrients: {
                calories: 520,
                protein: 40,
                carbs: 45,
                fat: 18,
                fiber: 8,
                sugar: 8,
                sodium: 580
              },
              tags: ['lunch', 'quick', 'balanced'],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          set({
            mealTemplates: mockTemplates,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch meal templates'
          });
        }
      },

      saveMealTemplate: async (template: Omit<MealTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newTemplate: MealTemplate = {
            ...template,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const mealTemplates = [...get().mealTemplates, newTemplate];
          set({
            mealTemplates,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to save meal template'
          });
        }
      },

      updateMealTemplate: async (id: string, updates: Partial<MealTemplate>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const mealTemplates = get().mealTemplates.map(template =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date() }
              : template
          );

          set({
            mealTemplates,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update meal template'
          });
        }
      },

      deleteMealTemplate: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const mealTemplates = get().mealTemplates.filter(template => template.id !== id);
          set({
            mealTemplates,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete meal template'
          });
        }
      },

      applyMealTemplate: async (templateId: string, date: Date, mealType: MealType) => {
        set({ loading: true, error: null });
        try {
          const template = get().mealTemplates.find(t => t.id === templateId);
          if (!template) throw new Error('Template not found');

          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newMeal: Meal = {
            id: Date.now().toString(),
            userId: '1',
            name: template.name,
            type: mealType,
            foods: [...template.foods],
            totalNutrients: { ...template.totalNutrients },
            date,
            time: mealType === 'breakfast' ? '08:00' : mealType === 'lunch' ? '12:00' : mealType === 'dinner' ? '18:00' : '15:00',
            notes: `Created from template: ${template.name}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          if (date.toDateString() === new Date().toDateString()) {
            const todaysMeals = [...get().todaysMeals, newMeal];
            set({ todaysMeals });
          }

          set({ loading: false, error: null });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to apply meal template'
          });
        }
      },

      addFoodToMeal: async (mealId: string, food: Food) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const todaysMeals = get().todaysMeals.map(meal => {
            if (meal.id === mealId) {
              const updatedFoods = [...meal.foods, food];
              const totalNutrients = get().calculateMealNutrients(updatedFoods);
              
              return {
                ...meal,
                foods: updatedFoods,
                totalNutrients,
                updatedAt: new Date()
              };
            }
            return meal;
          });

          set({
            todaysMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to add food to meal'
          });
        }
      },

      removeFoodFromMeal: async (mealId: string, foodId: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const todaysMeals = get().todaysMeals.map(meal => {
            if (meal.id === mealId) {
              const updatedFoods = meal.foods.filter(f => f.id !== foodId);
              const totalNutrients = get().calculateMealNutrients(updatedFoods);
              
              return {
                ...meal,
                foods: updatedFoods,
                totalNutrients,
                updatedAt: new Date()
              };
            }
            return meal;
          });

          set({
            todaysMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to remove food from meal'
          });
        }
      },

      updateFoodQuantity: async (mealId: string, foodId: string, quantity: number) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const todaysMeals = get().todaysMeals.map(meal => {
            if (meal.id === mealId) {
              const updatedFoods = meal.foods.map(f => 
                f.id === foodId ? { ...f, quantity } : f
              );
              const totalNutrients = get().calculateMealNutrients(updatedFoods);
              
              return {
                ...meal,
                foods: updatedFoods,
                totalNutrients,
                updatedAt: new Date()
              };
            }
            return meal;
          });

          set({
            todaysMeals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update food quantity'
          });
        }
      },

      calculateMealNutrients: (foods: Food[]) => {
        const totals: Record<string, number> = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        };

        foods.forEach(food => {
          const multiplier = food.quantity / food.servingSize;
          Object.keys(totals).forEach(nutrient => {
            const value = food.nutrients[nutrient as keyof typeof food.nutrients];
            if (value) {
              totals[nutrient] += value * multiplier;
            }
          });
        });

        return totals;
      },

      getMealsByType: (type: MealType) => {
        return get().todaysMeals.filter(meal => meal.type === type);
      },

      setSelectedMeal: (meal: Meal | null) => set({ selectedMeal: meal }),
      
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'meal-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mealTemplates: state.mealTemplates
      })
    }
  )
);