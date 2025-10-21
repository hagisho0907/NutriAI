// API configuration for NutriAI app
import type { ApiResponse, ApiError } from '../../types/api'

export interface APIConfig {
  baseURL: string
  timeout: number
  retries: number
  headers?: Record<string, string>
  mock: boolean
}

export const getAPIConfig = (): APIConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false' && isDevelopment

  return {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
    headers: {
      'Content-Type': 'application/json',
    },
    mock: useMock,
  }
}

export const api = getAPIConfig()

// Response transformer
export const transformResponse = <T>(response: any): ApiResponse<T> => {
  return {
    data: response,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  }
}

// Error transformer
export const transformError = (error: any): ApiError => {
  return {
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error.details || [],
      traceId: error.traceId || `trace_${Date.now()}`,
    },
  }
}

// Standard delay for realistic mock responses
export const MOCK_DELAY = {
  fast: 200,
  medium: 500,
  slow: 1000,
  network: 1500,
}

// Mock response delay utility
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))