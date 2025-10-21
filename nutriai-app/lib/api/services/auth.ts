// Authentication API service
import { apiClient } from '../client'
import type { AuthTokens, GuestLoginResponse } from '../../../types/api'
import type { UserWithProfile } from '../../../types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName?: string
}

export const authService = {
  // Login with email and password
  async login(credentials: LoginRequest): Promise<GuestLoginResponse> {
    const response = await apiClient.post<GuestLoginResponse>('/auth/login', credentials)
    return response.data
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<GuestLoginResponse> {
    const response = await apiClient.post<GuestLoginResponse>('/auth/register', userData)
    return response.data
  },

  // Guest login
  async guestLogin(): Promise<GuestLoginResponse> {
    const response = await apiClient.post<GuestLoginResponse>('/auth/guest-login')
    return response.data
  },

  // Refresh authentication token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken })
    return response.data
  },

  // Logout
  async logout(): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('/auth/logout')
    return response.data
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserWithProfile> {
    const response = await apiClient.get<UserWithProfile>('/auth/me')
    return response.data
  },
}