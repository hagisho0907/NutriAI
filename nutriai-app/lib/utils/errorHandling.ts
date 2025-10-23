export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0, true);
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode: number, retryable: boolean = false) {
    super(message, 'API_ERROR', statusCode, retryable);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, false);
  }
}

export class ImageProcessingError extends AppError {
  constructor(message: string) {
    super(message, 'IMAGE_PROCESSING_ERROR', 422, false);
  }
}

export class VisionAnalysisError extends AppError {
  constructor(message: string, retryable: boolean = true) {
    super(message, 'VISION_ANALYSIS_ERROR', 503, retryable);
  }
}

export class StorageError extends AppError {
  constructor(message: string, retryable: boolean = true) {
    super(message, 'STORAGE_ERROR', 503, retryable);
  }
}

// Error classification
export function classifyError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch')) {
      return new NetworkError(error.message);
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return new APIError('Request timeout', 408, true);
    }

    // File/Image errors
    if (error.message.includes('image') || error.message.includes('file')) {
      return new ImageProcessingError(error.message);
    }

    // Generic error
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, false);
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500, false);
}

// User-friendly error messages
export function getErrorMessage(error: AppError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'インターネット接続を確認してください';
    case 'IMAGE_PROCESSING_ERROR':
      return '画像の処理に失敗しました。別の画像を試してください';
    case 'VISION_ANALYSIS_ERROR':
      return 'AI分析に失敗しました。しばらくしてから再試行してください';
    case 'STORAGE_ERROR':
      return '画像のアップロードに失敗しました。再試行してください';
    case 'VALIDATION_ERROR':
      return error.message;
    case 'API_ERROR':
      if (error.statusCode === 429) {
        return 'リクエストが多すぎます。しばらくお待ちください';
      }
      if (error.statusCode >= 500) {
        return 'サーバーエラーが発生しました。しばらくしてから再試行してください';
      }
      return error.message;
    default:
      return '予期しないエラーが発生しました';
  }
}