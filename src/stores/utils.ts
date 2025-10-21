import { StateCreator } from 'zustand';
import { APIError, ValidationRule, ValidationResult, CacheEntry, CacheOptions } from './types';

// API utility functions
export const createAPIError = (status: number, message: string, code?: string, details?: any): APIError => ({
  status,
  message,
  code,
  details
});

export const handleAPIResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw createAPIError(
      response.status,
      errorData.message || `HTTP ${response.status}`,
      errorData.code,
      errorData
    );
  }
  return response.json();
};

// Validation utilities
export const validateData = <T>(data: T, rules: ValidationRule<T>[]): ValidationResult => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  rules.forEach(rule => {
    const value = data[rule.field];
    const result = rule.validator(value);
    
    if (result !== true) {
      isValid = false;
      const fieldName = String(rule.field);
      if (!errors[fieldName]) {
        errors[fieldName] = [];
      }
      errors[fieldName].push(typeof result === 'string' ? result : rule.message || 'Validation failed');
    }
  });

  return { isValid, errors };
};

// Common validation rules
export const validationRules = {
  required: <T>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => value != null && value !== '',
    message: message || `${String(field)} is required`
  }),
  
  email: <T>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: message || 'Invalid email format'
  }),
  
  minLength: <T>(field: keyof T, length: number, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => !value || value.length >= length,
    message: message || `${String(field)} must be at least ${length} characters`
  }),
  
  maxLength: <T>(field: keyof T, length: number, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => !value || value.length <= length,
    message: message || `${String(field)} must be no more than ${length} characters`
  }),
  
  positive: <T>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => !value || (typeof value === 'number' && value > 0),
    message: message || `${String(field)} must be positive`
  }),
  
  range: <T>(field: keyof T, min: number, max: number, message?: string): ValidationRule<T> => ({
    field,
    validator: (value) => !value || (typeof value === 'number' && value >= min && value <= max),
    message: message || `${String(field)} must be between ${min} and ${max}`
  })
};

// Cache utilities
export class StoreCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      strategy: options.strategy || 'LRU'
    };
  }

  set(key: string, data: T, customTTL?: number): void {
    const now = new Date();
    const ttl = customTTL || this.options.ttl;
    const expiresAt = new Date(now.getTime() + ttl);

    // Remove expired entries
    this.cleanup();

    // Check cache size and evict if necessary
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt && new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update timestamp for LRU
    if (this.options.strategy === 'LRU') {
      entry.timestamp = new Date();
      this.cache.set(key, entry);
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;
    
    if (this.options.strategy === 'LRU') {
      // Find least recently used
      let oldestTimestamp = new Date();
      keyToEvict = '';
      
      for (const [key, entry] of this.cache.entries()) {
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
          keyToEvict = key;
        }
      }
    } else {
      // FIFO - remove first entry
      keyToEvict = this.cache.keys().next().value;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }
}

// Debounce utility for store actions
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Throttle utility for store actions
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let lastExecution = 0;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastExecution >= delay) {
      lastExecution = now;
      func(...args);
    }
  }) as T;
};

// Retry utility for async operations
export const retry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: boolean = true
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

// Store state comparison utility
export const isShallowEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
    return false;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || a[key] !== b[key]) {
      return false;
    }
  }
  
  return true;
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// Local storage utilities
export const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeJsonStringify = (value: any): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
};

// Store middleware creators
export const createLoggingMiddleware = <T>(storeName: string) => {
  return (config: StateCreator<T>) => (set: any, get: any, api: any) =>
    config(
      (...args) => {
        console.log(`[${storeName}] State update:`, args);
        set(...args);
      },
      get,
      api
    );
};

export const createErrorHandlingMiddleware = <T>(
  onError: (error: Error, storeName: string) => void
) => {
  return (storeName: string) => (config: StateCreator<T>) => (set: any, get: any, api: any) =>
    config(
      (...args) => {
        try {
          set(...args);
        } catch (error) {
          onError(error as Error, storeName);
        }
      },
      get,
      api
    );
};

// Date utilities for stores
export const dateUtils = {
  isToday: (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },
  
  isThisWeek: (date: Date): boolean => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    return date >= weekStart;
  },
  
  isThisMonth: (date: Date): boolean => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  },
  
  formatRelative: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
};

// Performance utilities
export const performanceUtils = {
  measure: <T>(operation: () => T, label: string): T => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    console.log(`[Performance] ${label}: ${end - start}ms`);
    return result;
  },
  
  measureAsync: async <T>(operation: () => Promise<T>, label: string): Promise<T> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    console.log(`[Performance] ${label}: ${end - start}ms`);
    return result;
  }
};