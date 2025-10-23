import { AppError, classifyError } from './errorHandling';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: AppError) => boolean;
  onRetry?: (attempt: number, error: AppError) => void;
}

export const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: (error) => error.retryable,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: AppError;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error);

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === opts.maxAttempts || !opts.retryCondition!(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const finalDelay = delay + jitter;

      console.warn(`Attempt ${attempt} failed, retrying in ${finalDelay}ms:`, lastError.message);

      if (opts.onRetry) {
        opts.onRetry(attempt, lastError);
      }

      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError!;
}

// Specialized retry for API calls
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  operation: string = 'API call'
): Promise<T> {
  return withRetry(apiCall, {
    maxAttempts: 3,
    baseDelay: 1000,
    retryCondition: (error) => {
      // Retry on network errors and 5xx server errors
      return error.retryable || (error.statusCode >= 500 && error.statusCode < 600);
    },
    onRetry: (attempt, error) => {
      console.log(`Retrying ${operation} (attempt ${attempt}):`, error.message);
    }
  });
}

// Specialized retry for image upload
export async function retryImageUpload<T>(
  uploadFn: () => Promise<T>
): Promise<T> {
  return withRetry(uploadFn, {
    maxAttempts: 3,
    baseDelay: 2000,
    retryCondition: (error) => {
      // Retry on network errors and storage errors
      return error.code === 'NETWORK_ERROR' || error.code === 'STORAGE_ERROR';
    },
    onRetry: (attempt, error) => {
      console.log(`Retrying image upload (attempt ${attempt}):`, error.message);
    }
  });
}

// Specialized retry for vision analysis
export async function retryVisionAnalysis<T>(
  analysisFn: () => Promise<T>
): Promise<T> {
  return withRetry(analysisFn, {
    maxAttempts: 2, // Fewer retries for expensive operations
    baseDelay: 3000,
    retryCondition: (error) => {
      // Only retry on network errors or temporary server issues
      return error.code === 'NETWORK_ERROR' || 
             (error.code === 'API_ERROR' && error.statusCode >= 500);
    },
    onRetry: (attempt, error) => {
      console.log(`Retrying vision analysis (attempt ${attempt}):`, error.message);
    }
  });
}