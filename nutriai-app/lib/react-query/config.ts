// React Query configuration
import { QueryClient } from '@tanstack/react-query'

// Query stale time configurations
export const STALE_TIME = {
  SHORT: 1000 * 60 * 1, // 1 minute
  MEDIUM: 1000 * 60 * 5, // 5 minutes
  LONG: 1000 * 60 * 30, // 30 minutes
  VERY_LONG: 1000 * 60 * 60, // 1 hour
} as const

// Cache time configurations
export const CACHE_TIME = {
  SHORT: 1000 * 60 * 5, // 5 minutes
  MEDIUM: 1000 * 60 * 15, // 15 minutes
  LONG: 1000 * 60 * 30, // 30 minutes
  VERY_LONG: 1000 * 60 * 60, // 1 hour
} as const

// Retry configurations
export const RETRY_CONFIG = {
  DEFAULT: 3,
  EXPENSIVE: 1,
  NONE: false,
} as const

// Create Query Client with default configuration
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale-while-revalidate strategy
        staleTime: STALE_TIME.MEDIUM,
        gcTime: CACHE_TIME.LONG, // Previously known as cacheTime in v4
        
        // Retry configuration
        retry: RETRY_CONFIG.DEFAULT,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Network mode
        networkMode: 'online',
        
        // Refetch configuration
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Error handling
        throwOnError: false,
        
        // Background refetch interval (disabled by default)
        refetchInterval: false,
        refetchIntervalInBackground: false,
      },
      mutations: {
        // Retry configuration for mutations
        retry: RETRY_CONFIG.EXPENSIVE,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        
        // Network mode
        networkMode: 'online',
        
        // Error handling
        throwOnError: false,
      },
    },
  })
}

// Global error handler for React Query
export const queryErrorHandler = (error: unknown) => {
  console.error('React Query Error:', error)
  
  // You can add global error handling logic here
  // For example, showing toast notifications, logging to analytics, etc.
}

// Utility function to determine if we should retry based on error
export const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // Don't retry on certain error types
  if (error instanceof Error) {
    // Don't retry on authentication errors
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return false
    }
    
    // Don't retry on validation errors
    if (error.message.includes('400') || error.message.includes('Bad Request')) {
      return false
    }
    
    // Don't retry on not found errors
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return false
    }
  }
  
  // Default retry logic
  return failureCount < RETRY_CONFIG.DEFAULT
}