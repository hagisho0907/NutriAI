import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BodyMetrics, BodyMetricsGoal, MetricType, TrendDirection } from '../types';

interface BodyMetricsStore {
  // State
  metrics: BodyMetrics[];
  currentMetrics: BodyMetrics | null;
  metricsGoals: BodyMetricsGoal[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchMetrics: (startDate: Date, endDate: Date) => Promise<void>;
  fetchLatestMetrics: () => Promise<void>;
  addMetrics: (metrics: Omit<BodyMetrics, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMetrics: (id: string, updates: Partial<BodyMetrics>) => Promise<void>;
  deleteMetrics: (id: string) => Promise<void>;
  
  // Goal actions
  fetchMetricsGoals: () => Promise<void>;
  createMetricsGoal: (goal: Omit<BodyMetricsGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMetricsGoal: (id: string, updates: Partial<BodyMetricsGoal>) => Promise<void>;
  deleteMetricsGoal: (id: string) => Promise<void>;
  
  // Analytics actions
  calculateBMI: (weight: number, height: number) => number;
  calculateBMR: (weight: number, height: number, age: number, gender: 'male' | 'female') => number;
  calculateTDEE: (bmr: number, activityLevel: string) => number;
  getMetricTrend: (metricType: MetricType, days?: number) => TrendDirection;
  getMetricProgress: (metricType: MetricType) => { current: number; goal: number; percentage: number } | null;
  getMetricHistory: (metricType: MetricType, days?: number) => Array<{ date: Date; value: number }>;
  calculateWeeklyAverage: (metricType: MetricType) => number;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBodyMetricsStore = create<BodyMetricsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      metrics: [],
      currentMetrics: null,
      metricsGoals: [],
      loading: false,
      error: null,

      // Actions
      fetchMetrics: async (startDate: Date, endDate: Date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock metrics data for date range
          const mockMetrics: BodyMetrics[] = [];
          const currentDate = new Date(startDate);
          let baseWeight = 75;
          
          while (currentDate <= endDate) {
            // Simulate weight fluctuation
            baseWeight += (Math.random() - 0.5) * 0.5;
            
            mockMetrics.push({
              id: `metrics-${currentDate.toISOString()}`,
              userId: '1',
              date: new Date(currentDate),
              weight: Number(baseWeight.toFixed(1)),
              height: 175,
              bodyFatPercentage: 20 + (Math.random() - 0.5) * 2,
              muscleMass: 60 + (Math.random() - 0.5) * 2,
              waterPercentage: 60 + (Math.random() - 0.5) * 2,
              boneMass: 3 + (Math.random() - 0.5) * 0.2,
              visceralFat: 10 + (Math.random() - 0.5),
              measurements: {
                chest: 95 + (Math.random() - 0.5) * 2,
                waist: 80 + (Math.random() - 0.5) * 2,
                hips: 95 + (Math.random() - 0.5) * 2,
                neck: 38 + (Math.random() - 0.5),
                arms: {
                  left: 30 + (Math.random() - 0.5),
                  right: 30 + (Math.random() - 0.5)
                },
                thighs: {
                  left: 55 + (Math.random() - 0.5) * 2,
                  right: 55 + (Math.random() - 0.5) * 2
                },
                calves: {
                  left: 38 + (Math.random() - 0.5),
                  right: 38 + (Math.random() - 0.5)
                }
              },
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
          }

          set({
            metrics: mockMetrics,
            currentMetrics: mockMetrics[mockMetrics.length - 1] || null,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch metrics'
          });
        }
      },

      fetchLatestMetrics: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock latest metrics
          const mockMetrics: BodyMetrics = {
            id: '1',
            userId: '1',
            date: new Date(),
            weight: 75,
            height: 175,
            bodyFatPercentage: 20,
            muscleMass: 60,
            waterPercentage: 60,
            boneMass: 3,
            visceralFat: 10,
            measurements: {
              chest: 95,
              waist: 80,
              hips: 95,
              neck: 38,
              arms: { left: 30, right: 30 },
              thighs: { left: 55, right: 55 },
              calves: { left: 38, right: 38 }
            },
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          set({
            currentMetrics: mockMetrics,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch latest metrics'
          });
        }
      },

      addMetrics: async (metrics: Omit<BodyMetrics, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newMetrics: BodyMetrics = {
            ...metrics,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const allMetrics = [...get().metrics, newMetrics].sort((a, b) => 
            a.date.getTime() - b.date.getTime()
          );

          set({
            metrics: allMetrics,
            currentMetrics: newMetrics,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to add metrics'
          });
        }
      },

      updateMetrics: async (id: string, updates: Partial<BodyMetrics>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const metrics = get().metrics.map(metric =>
            metric.id === id
              ? { ...metric, ...updates, updatedAt: new Date() }
              : metric
          );

          const updatedMetric = metrics.find(m => m.id === id);
          const currentMetrics = get().currentMetrics;

          set({
            metrics,
            currentMetrics: currentMetrics?.id === id ? updatedMetric || currentMetrics : currentMetrics,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update metrics'
          });
        }
      },

      deleteMetrics: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const metrics = get().metrics.filter(metric => metric.id !== id);
          const currentMetrics = get().currentMetrics;

          set({
            metrics,
            currentMetrics: currentMetrics?.id === id ? metrics[metrics.length - 1] || null : currentMetrics,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete metrics'
          });
        }
      },

      fetchMetricsGoals: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock metrics goals
          const mockGoals: BodyMetricsGoal[] = [
            {
              id: '1',
              userId: '1',
              type: 'weight_loss',
              targetMetrics: {
                weight: 70,
                bodyFatPercentage: 15,
                muscleMass: 65
              },
              targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
              startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          set({
            metricsGoals: mockGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch metrics goals'
          });
        }
      },

      createMetricsGoal: async (goal: Omit<BodyMetricsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newGoal: BodyMetricsGoal = {
            ...goal,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const metricsGoals = [...get().metricsGoals, newGoal];
          set({
            metricsGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create metrics goal'
          });
        }
      },

      updateMetricsGoal: async (id: string, updates: Partial<BodyMetricsGoal>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const metricsGoals = get().metricsGoals.map(goal =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date() }
              : goal
          );

          set({
            metricsGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update metrics goal'
          });
        }
      },

      deleteMetricsGoal: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const metricsGoals = get().metricsGoals.filter(goal => goal.id !== id);
          set({
            metricsGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete metrics goal'
          });
        }
      },

      calculateBMI: (weight: number, height: number) => {
        const heightInMeters = height / 100;
        return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
      },

      calculateBMR: (weight: number, height: number, age: number, gender: 'male' | 'female') => {
        // Using Mifflin-St Jeor Equation
        if (gender === 'male') {
          return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
        } else {
          return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
        }
      },

      calculateTDEE: (bmr: number, activityLevel: string) => {
        const activityMultipliers: Record<string, number> = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          veryActive: 1.9
        };
        
        return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
      },

      getMetricTrend: (metricType: MetricType, days: number = 7) => {
        const metrics = get().metrics;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentMetrics = metrics
          .filter(m => m.date >= cutoffDate)
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        if (recentMetrics.length < 2) return 'stable';
        
        const getValue = (m: BodyMetrics): number => {
          switch (metricType) {
            case 'weight': return m.weight;
            case 'bodyFat': return m.bodyFatPercentage || 0;
            case 'muscleMass': return m.muscleMass || 0;
            case 'waist': return m.measurements?.waist || 0;
            default: return 0;
          }
        };
        
        const firstValue = getValue(recentMetrics[0]);
        const lastValue = getValue(recentMetrics[recentMetrics.length - 1]);
        const change = lastValue - firstValue;
        const changePercentage = (change / firstValue) * 100;
        
        if (Math.abs(changePercentage) < 1) return 'stable';
        return change > 0 ? 'up' : 'down';
      },

      getMetricProgress: (metricType: MetricType) => {
        const current = get().currentMetrics;
        const goals = get().metricsGoals.find(g => g.isActive);
        
        if (!current || !goals) return null;
        
        let currentValue = 0;
        let goalValue = 0;
        
        switch (metricType) {
          case 'weight':
            currentValue = current.weight;
            goalValue = goals.targetMetrics.weight || 0;
            break;
          case 'bodyFat':
            currentValue = current.bodyFatPercentage || 0;
            goalValue = goals.targetMetrics.bodyFatPercentage || 0;
            break;
          case 'muscleMass':
            currentValue = current.muscleMass || 0;
            goalValue = goals.targetMetrics.muscleMass || 0;
            break;
        }
        
        if (goalValue === 0) return null;
        
        const percentage = Math.abs((currentValue - goalValue) / goalValue) * 100;
        
        return {
          current: currentValue,
          goal: goalValue,
          percentage: 100 - percentage
        };
      },

      getMetricHistory: (metricType: MetricType, days: number = 30) => {
        const metrics = get().metrics;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return metrics
          .filter(m => m.date >= cutoffDate)
          .map(m => {
            let value = 0;
            switch (metricType) {
              case 'weight': value = m.weight; break;
              case 'bodyFat': value = m.bodyFatPercentage || 0; break;
              case 'muscleMass': value = m.muscleMass || 0; break;
              case 'waist': value = m.measurements?.waist || 0; break;
            }
            return { date: m.date, value };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
      },

      calculateWeeklyAverage: (metricType: MetricType) => {
        const weekMetrics = get().getMetricHistory(metricType, 7);
        if (weekMetrics.length === 0) return 0;
        
        const sum = weekMetrics.reduce((total, m) => total + m.value, 0);
        return Number((sum / weekMetrics.length).toFixed(1));
      },

      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'body-metrics-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentMetrics: state.currentMetrics,
        metricsGoals: state.metricsGoals
      })
    }
  )
);