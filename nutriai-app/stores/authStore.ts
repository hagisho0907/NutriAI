import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserWithProfile, UserProfile, CreateUserGoalRequest } from '../types';
import { authService, APIError } from '../lib/api/services';

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
          const response = await authService.login({ email, password });
          
          // Get full user profile
          const userProfile = await authService.getCurrentUser();

          set({
            user: userProfile,
            token: response.tokens.accessToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof APIError ? error.message : 'Login failed'
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
          const response = await authService.register({
            email,
            password,
            displayName: name
          });
          
          // Get full user profile
          const userProfile = await authService.getCurrentUser();

          set({
            user: userProfile,
            token: response.tokens.accessToken,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof APIError ? error.message : 'Registration failed'
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
          const userProfile = await authService.getCurrentUser();
          set({ 
            user: userProfile,
            loading: false, 
            isAuthenticated: true 
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error instanceof APIError ? error.message : 'Authentication failed'
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