// Auth hooks for React Query
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService, type LoginRequest, type RegisterRequest } from '../../api/services/auth'
import { queryKeys, getRelatedQueryKeys } from '../query-keys'
import { STALE_TIME, CACHE_TIME } from '../config'
import type { GuestLoginResponse, AuthTokens } from '../../../types/api'
import type { UserWithProfile } from '../../../types'

// Auth query hooks

/**
 * Hook to get current user profile
 * Uses longer cache time since user data doesn't change frequently
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authService.getCurrentUser,
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
    retry: false, // Don't retry auth failures
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// Auth mutation hooks

/**
 * Hook for user login
 * Includes cache invalidation and optimistic updates
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data: GuestLoginResponse) => {
      // Update the current user cache with the new user data
      queryClient.setQueryData(queryKeys.auth.currentUser(), {
        id: data.user.id,
        email: data.user.email,
        profile: {},
      })

      // Invalidate all auth-related queries
      getRelatedQueryKeys.onAuthChange().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (error) => {
      console.error('Login failed:', error)
      // Clear any existing user data on login failure
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

/**
 * Hook for user registration
 * Similar to login with cache management
 */
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data: GuestLoginResponse) => {
      // Update the current user cache with the new user data
      queryClient.setQueryData(queryKeys.auth.currentUser(), {
        id: data.user.id,
        email: data.user.email,
        profile: {},
      })

      // Invalidate all auth-related queries
      getRelatedQueryKeys.onAuthChange().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    },
  })
}

/**
 * Hook for guest login
 * Provides a quick way to try the app without registration
 */
export function useGuestLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.guestLogin,
    onSuccess: (data: GuestLoginResponse) => {
      // Update the current user cache with guest user data
      queryClient.setQueryData(queryKeys.auth.currentUser(), {
        id: data.user.id,
        email: data.user.email,
        profile: {},
      })

      // Invalidate all auth-related queries
      getRelatedQueryKeys.onAuthChange().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
    onError: (error) => {
      console.error('Guest login failed:', error)
    },
  })
}

/**
 * Hook for token refresh
 * Automatically handles token renewal
 */
export function useRefreshToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (refreshToken: string) => authService.refreshToken(refreshToken),
    onSuccess: (tokens: AuthTokens) => {
      // Update stored tokens if needed
      // Note: This would typically be handled by your auth store/context
      console.log('Tokens refreshed successfully')
    },
    onError: (error) => {
      console.error('Token refresh failed:', error)
      // Clear all cached data on refresh failure
      queryClient.clear()
    },
    retry: 1, // Only retry once for token refresh
  })
}

/**
 * Hook for user logout
 * Clears all cached data and redirects
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()
      
      // Remove user-specific data from localStorage if needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
      }
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Still clear cache even if logout API fails
      queryClient.clear()
    },
    // Always succeed from UI perspective
    onSettled: () => {
      // Ensure cache is cleared regardless of API response
      queryClient.clear()
    },
  })
}

/**
 * Utility hook to check if user is authenticated
 * Based on current user query state
 */
export function useIsAuthenticated() {
  const { data: user, isLoading, error } = useCurrentUser()
  
  return {
    isAuthenticated: !!user && !error,
    isLoading,
    user,
  }
}

/**
 * Hook to update user profile
 * Updates the cached user data optimistically
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileData: Partial<UserWithProfile['profile']>) => {
      // This would be a real API call to update profile
      // For now, we'll simulate it by updating the cache
      const currentUser = queryClient.getQueryData<UserWithProfile>(queryKeys.auth.currentUser())
      if (!currentUser) {
        throw new Error('No current user found')
      }

      const updatedUser: UserWithProfile = {
        ...currentUser,
        profile: {
          ...currentUser.profile,
          ...profileData,
        },
      }

      return updatedUser
    },
    onMutate: async (profileData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.currentUser() })

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<UserWithProfile>(queryKeys.auth.currentUser())

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData(queryKeys.auth.currentUser(), {
          ...previousUser,
          profile: {
            ...previousUser.profile,
            ...profileData,
          },
        })
      }

      return { previousUser }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.auth.currentUser(), context.previousUser)
      }
      console.error('Profile update failed:', error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() })
    },
  })
}