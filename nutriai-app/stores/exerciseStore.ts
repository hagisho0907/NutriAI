import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Exercise, ExerciseSession, ExerciseGoal, ExerciseType } from '../types';

interface ExerciseStore {
  // State
  exercises: Exercise[];
  sessions: ExerciseSession[];
  todaysSessions: ExerciseSession[];
  exerciseGoals: ExerciseGoal[];
  favoriteExercises: Exercise[];
  selectedSession: ExerciseSession | null;
  loading: boolean;
  error: string | null;

  // Exercise actions
  fetchExercises: () => Promise<void>;
  searchExercises: (query: string, type?: ExerciseType) => Promise<Exercise[]>;
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  toggleFavoriteExercise: (exerciseId: string) => Promise<void>;

  // Session actions
  fetchSessions: (date: Date) => Promise<void>;
  fetchSessionHistory: (startDate: Date, endDate: Date) => Promise<void>;
  startSession: (name: string) => Promise<ExerciseSession>;
  endSession: (sessionId: string) => Promise<void>;
  addExerciseToSession: (sessionId: string, exercise: Exercise, sets?: number, reps?: number, duration?: number) => Promise<void>;
  removeExerciseFromSession: (sessionId: string, exerciseIndex: number) => Promise<void>;
  updateSessionExercise: (sessionId: string, exerciseIndex: number, updates: any) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;

  // Goal actions
  fetchExerciseGoals: () => Promise<void>;
  createExerciseGoal: (goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExerciseGoal: (id: string, updates: Partial<ExerciseGoal>) => Promise<void>;
  deleteExerciseGoal: (id: string) => Promise<void>;

  // Utility actions
  calculateSessionCalories: (session: ExerciseSession) => number;
  calculateWeeklyProgress: () => { totalSessions: number; totalDuration: number; totalCalories: number };
  getExercisesByType: (type: ExerciseType) => Exercise[];
  getExercisesByMuscleGroup: (muscleGroup: string) => Exercise[];
  setSelectedSession: (session: ExerciseSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      exercises: [],
      sessions: [],
      todaysSessions: [],
      exerciseGoals: [],
      favoriteExercises: [],
      selectedSession: null,
      loading: false,
      error: null,

      // Exercise actions
      fetchExercises: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock exercise data
          const mockExercises: Exercise[] = [
            {
              id: '1',
              name: 'Running',
              type: 'cardio',
              muscleGroups: ['legs', 'core'],
              equipment: 'none',
              difficulty: 'beginner',
              caloriesPerMinute: 10,
              description: 'Basic running exercise',
              instructions: ['Start at a comfortable pace', 'Maintain steady breathing'],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '2',
              name: 'Push-ups',
              type: 'strength',
              muscleGroups: ['chest', 'arms', 'shoulders'],
              equipment: 'none',
              difficulty: 'beginner',
              caloriesPerMinute: 7,
              description: 'Classic upper body exercise',
              instructions: ['Keep your body straight', 'Lower until chest nearly touches ground'],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '3',
              name: 'Squats',
              type: 'strength',
              muscleGroups: ['legs', 'glutes'],
              equipment: 'none',
              difficulty: 'beginner',
              caloriesPerMinute: 8,
              description: 'Lower body compound exercise',
              instructions: ['Keep back straight', 'Lower until thighs parallel to ground'],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          set({
            exercises: mockExercises,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch exercises'
          });
        }
      },

      searchExercises: async (query: string, type?: ExerciseType) => {
        const exercises = get().exercises;
        const filtered = exercises.filter(exercise => {
          const matchesQuery = exercise.name.toLowerCase().includes(query.toLowerCase()) ||
                              exercise.muscleGroups.some(mg => mg.toLowerCase().includes(query.toLowerCase()));
          const matchesType = !type || exercise.type === type;
          return matchesQuery && matchesType;
        });
        return filtered;
      },

      addCustomExercise: async (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newExercise: Exercise = {
            ...exercise,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const exercises = [...get().exercises, newExercise];
          set({
            exercises,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to add custom exercise'
          });
        }
      },

      updateExercise: async (id: string, updates: Partial<Exercise>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const exercises = get().exercises.map(exercise =>
            exercise.id === id
              ? { ...exercise, ...updates, updatedAt: new Date() }
              : exercise
          );

          set({
            exercises,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update exercise'
          });
        }
      },

      deleteExercise: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const exercises = get().exercises.filter(exercise => exercise.id !== id);
          set({
            exercises,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete exercise'
          });
        }
      },

      toggleFavoriteExercise: async (exerciseId: string) => {
        const exercise = get().exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const favorites = get().favoriteExercises;
        const isFavorite = favorites.some(e => e.id === exerciseId);

        if (isFavorite) {
          set({ favoriteExercises: favorites.filter(e => e.id !== exerciseId) });
        } else {
          set({ favoriteExercises: [...favorites, exercise] });
        }
      },

      fetchSessions: async (date: Date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock session data for the date
          const mockSessions: ExerciseSession[] = [
            {
              id: '1',
              userId: '1',
              name: 'Morning Workout',
              exercises: [
                {
                  exercise: get().exercises[0] || { id: '1', name: 'Running' } as Exercise,
                  sets: 1,
                  reps: undefined,
                  duration: 20,
                  distance: 5,
                  weight: undefined,
                  notes: 'Easy pace'
                }
              ],
              duration: 20,
              totalCaloriesBurned: 200,
              date,
              startTime: '07:00',
              endTime: '07:20',
              notes: 'Felt good',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          set({
            todaysSessions: mockSessions,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch sessions'
          });
        }
      },

      fetchSessionHistory: async (startDate: Date, endDate: Date) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock session history
          const mockSessions: ExerciseSession[] = [];
          const currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            if (Math.random() > 0.3) { // 70% chance of having a workout
              mockSessions.push({
                id: `session-${currentDate.toISOString()}`,
                userId: '1',
                name: 'Daily Workout',
                exercises: [
                  {
                    exercise: get().exercises[Math.floor(Math.random() * get().exercises.length)] || { id: '1', name: 'Running' } as Exercise,
                    sets: Math.floor(Math.random() * 3) + 1,
                    reps: Math.floor(Math.random() * 12) + 8,
                    duration: Math.floor(Math.random() * 30) + 10,
                    notes: ''
                  }
                ],
                duration: Math.floor(Math.random() * 45) + 15,
                totalCaloriesBurned: Math.floor(Math.random() * 300) + 100,
                date: new Date(currentDate),
                startTime: '07:00',
                endTime: '08:00',
                notes: '',
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          set({
            sessions: mockSessions,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch session history'
          });
        }
      },

      startSession: async (name: string) => {
        const newSession: ExerciseSession = {
          id: Date.now().toString(),
          userId: '1',
          name,
          exercises: [],
          duration: 0,
          totalCaloriesBurned: 0,
          date: new Date(),
          startTime: new Date().toTimeString().slice(0, 5),
          endTime: undefined,
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const todaysSessions = [...get().todaysSessions, newSession];
        set({ todaysSessions, selectedSession: newSession });

        return newSession;
      },

      endSession: async (sessionId: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const todaysSessions = get().todaysSessions.map(session => {
            if (session.id === sessionId) {
              const endTime = new Date().toTimeString().slice(0, 5);
              const duration = session.exercises.reduce((total, ex) => total + (ex.duration || 0), 0);
              const totalCaloriesBurned = get().calculateSessionCalories(session);

              return {
                ...session,
                endTime,
                duration,
                totalCaloriesBurned,
                updatedAt: new Date()
              };
            }
            return session;
          });

          set({
            todaysSessions,
            selectedSession: null,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to end session'
          });
        }
      },

      addExerciseToSession: async (sessionId: string, exercise: Exercise, sets?: number, reps?: number, duration?: number) => {
        const todaysSessions = get().todaysSessions.map(session => {
          if (session.id === sessionId) {
            const newExercise = {
              exercise,
              sets: sets || 1,
              reps,
              duration,
              weight: undefined,
              distance: undefined,
              notes: ''
            };

            return {
              ...session,
              exercises: [...session.exercises, newExercise],
              updatedAt: new Date()
            };
          }
          return session;
        });

        set({ todaysSessions });
      },

      removeExerciseFromSession: async (sessionId: string, exerciseIndex: number) => {
        const todaysSessions = get().todaysSessions.map(session => {
          if (session.id === sessionId) {
            const exercises = [...session.exercises];
            exercises.splice(exerciseIndex, 1);

            return {
              ...session,
              exercises,
              updatedAt: new Date()
            };
          }
          return session;
        });

        set({ todaysSessions });
      },

      updateSessionExercise: async (sessionId: string, exerciseIndex: number, updates: any) => {
        const todaysSessions = get().todaysSessions.map(session => {
          if (session.id === sessionId) {
            const exercises = [...session.exercises];
            exercises[exerciseIndex] = { ...exercises[exerciseIndex], ...updates };

            return {
              ...session,
              exercises,
              updatedAt: new Date()
            };
          }
          return session;
        });

        set({ todaysSessions });
      },

      deleteSession: async (sessionId: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const todaysSessions = get().todaysSessions.filter(session => session.id !== sessionId);
          set({
            todaysSessions,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete session'
          });
        }
      },

      fetchExerciseGoals: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock exercise goals
          const mockGoals: ExerciseGoal[] = [
            {
              id: '1',
              userId: '1',
              type: 'weekly',
              target: {
                sessions: 4,
                duration: 180,
                caloriesBurned: 1500
              },
              current: {
                sessions: 2,
                duration: 90,
                caloriesBurned: 750
              },
              startDate: new Date(new Date().setDate(new Date().getDate() - 3)),
              endDate: new Date(new Date().setDate(new Date().getDate() + 4)),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];

          set({
            exerciseGoals: mockGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch exercise goals'
          });
        }
      },

      createExerciseGoal: async (goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newGoal: ExerciseGoal = {
            ...goal,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const exerciseGoals = [...get().exerciseGoals, newGoal];
          set({
            exerciseGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create exercise goal'
          });
        }
      },

      updateExerciseGoal: async (id: string, updates: Partial<ExerciseGoal>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const exerciseGoals = get().exerciseGoals.map(goal =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date() }
              : goal
          );

          set({
            exerciseGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update exercise goal'
          });
        }
      },

      deleteExerciseGoal: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const exerciseGoals = get().exerciseGoals.filter(goal => goal.id !== id);
          set({
            exerciseGoals,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete exercise goal'
          });
        }
      },

      calculateSessionCalories: (session: ExerciseSession) => {
        return session.exercises.reduce((total, ex) => {
          const caloriesPerMinute = ex.exercise.caloriesPerMinute || 5;
          const duration = ex.duration || 0;
          return total + (caloriesPerMinute * duration);
        }, 0);
      },

      calculateWeeklyProgress: () => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekSessions = get().sessions.filter(session => 
          session.date >= weekStart
        );

        return {
          totalSessions: weekSessions.length,
          totalDuration: weekSessions.reduce((total, session) => total + session.duration, 0),
          totalCalories: weekSessions.reduce((total, session) => total + session.totalCaloriesBurned, 0)
        };
      },

      getExercisesByType: (type: ExerciseType) => {
        return get().exercises.filter(exercise => exercise.type === type);
      },

      getExercisesByMuscleGroup: (muscleGroup: string) => {
        return get().exercises.filter(exercise => 
          exercise.muscleGroups.includes(muscleGroup)
        );
      },

      setSelectedSession: (session: ExerciseSession | null) => set({ selectedSession: session }),
      
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'exercise-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteExercises: state.favoriteExercises
      })
    }
  )
);