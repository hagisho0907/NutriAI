// API client for NutriAI app
import { api, transformResponse, transformError } from './config'
import type { ApiResponse, ApiError } from '../../types/api'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

export class APIError extends Error {
  status: number
  code?: string
  details?: any

  constructor(error: ApiError, status: number = 500) {
    super(error.error.message)
    this.name = 'APIError'
    this.status = status
    this.code = error.error.code
    this.details = error.error.details
  }
}

class APIClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number
  private retries: number

  constructor() {
    this.baseURL = api.baseURL
    this.defaultHeaders = api.headers || {}
    this.timeout = api.timeout
    this.retries = api.retries
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`
    const headers = { ...this.defaultHeaders, ...options.headers }
    
    // Add auth token if available
    const token = this.getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      ...(options.body && { body: JSON.stringify(options.body) }),
    }

    let lastError: Error
    const maxRetries = options.retries ?? this.retries

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(
          () => controller.abort(),
          options.timeout ?? this.timeout
        )

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new APIError(transformError(errorData), response.status)
        }

        const data = await response.json()
        return transformResponse<T>(data)
      } catch (error) {
        lastError = error as Error
        
        // Don't retry for certain errors
        if (error instanceof APIError && error.status < 500) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          )
        }
      }
    }

    throw lastError!
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (!authStorage) return null
      
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || null
    } catch {
      return null
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new APIClient()