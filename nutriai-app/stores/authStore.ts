import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserWithProfile, UserProfile, CreateUserGoalRequest } from '../types/user';

interface AuthStore {
  // State
  user: UserWithProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUser: (user: UserWithProfile | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data
          const mockUser: UserWithProfile = {
            id: '1',
            email,
            loginProvider: 'email',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              userId: '1',
              displayName: 'John Doe',
              gender: 'male',
              birthDate: '1994-01-01',
              heightCm: 175,
              activityLevel: 'moderate',
              bodyFatPct: 15
            }
          };

          const mockToken = 'mock-jwt-token';

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      register: async (email: string, password: string, name: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: UserWithProfile = {
            id: '1',
            email,
            loginProvider: 'email',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profile: {
              userId: '1',
              displayName: name,
              activityLevel: 'moderate'
            }
          };

          const mockToken = 'mock-jwt-token';

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Registration failed'
          });
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        set({ loading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error('User not authenticated');

          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));

          const updatedUser: UserWithProfile = {
            ...currentUser,
            profile: {
              ...currentUser.profile,
              ...updates
            },
            updatedAt: new Date().toISOString()
          };

          set({
            user: updatedUser,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Profile update failed'
          });
        }
      },

      setUser: (user: UserWithProfile | null) => set({ user }),
      
      setToken: (token: string | null) => set({ token, isAuthenticated: !!token }),
      
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error }),
      
      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ loading: true });
        try {
          // TODO: Replace with actual API call to verify token
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // If token is valid, user data should already be in state
          set({ loading: false, isAuthenticated: true });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: 'Authentication failed'
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
