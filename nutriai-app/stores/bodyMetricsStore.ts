import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BodyMetrics } from '../types/body-metrics'

interface BodyMetricsStore {
  metrics: BodyMetrics[]
  currentMetrics: BodyMetrics | null
  loading: boolean
  error: string | null
  fetchMetrics: (startDate: string, endDate: string) => Promise<void>
  fetchLatestMetrics: () => Promise<void>
  addMetrics: (metrics: Omit<BodyMetrics, 'id' | 'createdAt'>) => Promise<void>
  updateMetrics: (id: string, updates: Partial<BodyMetrics>) => Promise<void>
  deleteMetrics: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const createMockMetric = (offsetDays = 0): BodyMetrics => {
  const date = new Date()
  date.setDate(date.getDate() - offsetDays)
  return {
    id: `mock-metric-${offsetDays}`,
    userId: 'mock-user',
    recordedOn: date.toISOString().split('T')[0],
    measurementDate: date.toISOString(),
    weightKg: Number((74 + Math.sin(offsetDays / 3)).toFixed(1)),
    bodyFatPct: Number((20 + Math.cos(offsetDays / 4)).toFixed(1)),
    skeletalMuscleKg: Number((32 + Math.sin(offsetDays / 5)).toFixed(1)),
    visceralFatLevel: Number((9 + Math.sin(offsetDays / 6)).toFixed(1)),
    basalMetabolicRate: 1600 + offsetDays,
    notes: '',
    source: 'manual',
    createdAt: date.toISOString(),
  }
}

export const useBodyMetricsStore = create<BodyMetricsStore>()(
  persist(
    (set, get) => ({
      metrics: [],
      currentMetrics: null,
      loading: false,
      error: null,

      fetchMetrics: async (startDate: string, endDate: string) => {
        set({ loading: true, error: null })
        try {
          // TODO: Replace with real API call
          await new Promise((resolve) => setTimeout(resolve, 200))

          const start = new Date(startDate)
          const end = new Date(endDate)
          const mockMetrics: BodyMetrics[] = []

          for (
            let cursor = new Date(start);
            cursor <= end;
            cursor.setDate(cursor.getDate() + 1)
          ) {
            const offset =
              Math.round(
                (Date.now() - cursor.getTime()) / (1000 * 60 * 60 * 24),
              ) || 0
            mockMetrics.push(createMockMetric(offset))
          }

          set({
            metrics: mockMetrics,
            currentMetrics: mockMetrics[mockMetrics.length - 1] || null,
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch body metrics',
          })
        }
      },

      fetchLatestMetrics: async () => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          const latest = createMockMetric(0)
          set({
            currentMetrics: latest,
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch latest body metrics',
          })
        }
      },

      addMetrics: async (metrics) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          const newMetric: BodyMetrics = {
            ...metrics,
            id: `metric-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          set({
            metrics: [...get().metrics, newMetric],
            currentMetrics: newMetric,
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add body metrics',
          })
        }
      },

      updateMetrics: async (id, updates) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          const metrics = get().metrics.map((metric) =>
            metric.id === id
              ? {
                  ...metric,
                  ...updates,
                  createdAt: metric.createdAt,
                }
              : metric,
          )
          set({
            metrics,
            currentMetrics:
              get().currentMetrics?.id === id
                ? metrics.find((m) => m.id === id) || null
                : get().currentMetrics,
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update body metrics',
          })
        }
      },

      deleteMetrics: async (id) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          const metrics = get().metrics.filter((metric) => metric.id !== id)
          set({
            metrics,
            currentMetrics:
              get().currentMetrics?.id === id
                ? metrics[metrics.length - 1] || null
                : get().currentMetrics,
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete body metrics',
          })
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'body-metrics-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        metrics: state.metrics,
        currentMetrics: state.currentMetrics,
      }),
    },
  ),
)
