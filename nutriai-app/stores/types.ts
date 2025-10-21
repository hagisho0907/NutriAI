// Store-specific types and interfaces

// Base store interface that all stores should extend
export interface BaseStore {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Store operation result types
export interface StoreOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Async store action wrapper type
export type AsyncStoreAction<TArgs extends any[] = [], TReturn = void> = 
  (...args: TArgs) => Promise<TReturn>;

// Store selector type
export type StoreSelector<TState, TResult> = (state: TState) => TResult;

// Store middleware types
export interface StoreMiddleware<T> {
  name: string;
  apply: (store: T) => T;
}

// Persistence options
export interface StorePersistenceOptions {
  name: string;
  version?: number;
  migrate?: (persistedState: any, version: number) => any;
  whitelist?: string[];
  blacklist?: string[];
}

// Store subscription types
export type StoreListener<T> = (state: T, prevState: T) => void;
export type StoreUnsubscribe = () => void;

// API integration types
export interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

export interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

// Store hydration types
export interface StoreHydrationState {
  isHydrated: boolean;
  timestamp: Date;
}

// Store validation types
export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Store cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt?: Date;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  strategy?: 'LRU' | 'FIFO';
}

// Store sync types for offline support
export interface SyncQueueItem {
  id: string;
  action: string;
  payload: any;
  timestamp: Date;
  retries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  queueSize: number;
  syncing: boolean;
}

// Store analytics types
export interface StoreAnalytics {
  actionCounts: Record<string, number>;
  errorCounts: Record<string, number>;
  performanceMetrics: Record<string, number[]>;
  lastActive: Date;
}

// Store devtools types
export interface DevToolsConfig {
  name: string;
  enabled: boolean;
  trace: boolean;
  serialize?: {
    options?: any;
    replacer?: (key: string, value: any) => any;
    reviver?: (key: string, value: any) => any;
  };
}

// Generic CRUD operations interface
export interface CRUDOperations<T, TCreate = Omit<T, 'id' | 'createdAt' | 'updatedAt'>> {
  items: T[];
  selectedItem: T | null;
  
  // Read operations
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<T | null>;
  
  // Create operations
  create: (item: TCreate) => Promise<T>;
  
  // Update operations
  update: (id: string, updates: Partial<T>) => Promise<T>;
  
  // Delete operations
  delete: (id: string) => Promise<void>;
  
  // Selection
  select: (item: T | null) => void;
  
  // Utility
  findById: (id: string) => T | undefined;
  exists: (id: string) => boolean;
}

// Store factory types
export interface StoreConfig<T> {
  name: string;
  initialState: T;
  actions: Record<string, (...args: any[]) => any>;
  computed?: Record<string, (state: T) => any>;
  middleware?: StoreMiddleware<T>[];
  persistence?: StorePersistenceOptions;
}

// Export utility types for store creation
export type InferStoreType<T> = T extends (...args: any[]) => infer R ? R : never;
export type StoreApi<T> = T & {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: StoreListener<T>) => StoreUnsubscribe;
  destroy: () => void;
};