import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ExerciseLog, ExerciseTemplate } from '../types/exercise'

interface ExerciseStoreState {
  logs: ExerciseLog[]
  templates: ExerciseTemplate[]
  loading: boolean
  error: string | null
  fetchDaily: (date: string) => Promise<void>
  fetchTemplates: () => Promise<void>
  addLog: (log: Omit<ExerciseLog, 'id' | 'createdAt'>) => Promise<void>
  deleteLog: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const mockTemplate = (id: string, name: string): ExerciseTemplate => ({
  id,
  name,
  category: 'cardio',
  metValue: 6,
  defaultDurationMin: 30,
  defaultCalories: 200,
  createdAt: new Date().toISOString(),
})

const mockLog = (date: string): ExerciseLog => ({
  id: `log-${date}`,
  userId: 'mock-user',
  templateId: 'template-running',
  templateName: 'Running',
  performedAt: `${date}T07:30:00Z`,
  durationMin: 30,
  caloriesBurned: 230,
  intensityLevel: 'medium',
  notes: '',
  createdAt: new Date().toISOString(),
})

export const useExerciseStore = create<ExerciseStoreState>()(
  persist(
    (set, get) => ({
      logs: [],
      templates: [],
      loading: false,
      error: null,

      fetchDaily: async (date: string) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          set({
            logs: [mockLog(date)],
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch exercise logs',
          })
        }
      },

      fetchTemplates: async () => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          set({
            templates: [mockTemplate('template-running', 'Running')],
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch exercise templates',
          })
        }
      },

      addLog: async (log) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          const newLog: ExerciseLog = {
            ...log,
            id: `log-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          set({
            logs: [...get().logs, newLog],
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add exercise log',
          })
        }
      },

      deleteLog: async (id) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 100))
          set({
            logs: get().logs.filter((log) => log.id !== id),
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete exercise log',
          })
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'exercise-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        logs: state.logs,
        templates: state.templates,
      }),
    },
  ),
)
