// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '권한이 없습니다') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다') {
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = '네트워크 오류가 발생했습니다') {
    super(message, 'NETWORK_ERROR', 500);
    this.name = 'NetworkError';
  }
}

// Error handler utility functions
export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500);
  }
  
  return new AppError('알 수 없는 오류가 발생했습니다', 'UNKNOWN_ERROR', 500);
};

// Error logging utility
export const logError = (error: AppError, context?: Record<string, any>) => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  };
  
  if (import.meta.env.DEV) {
    console.error('Error logged:', errorInfo);
  } else {
    // In production, you might want to send errors to a logging service
    // Example: sendToLoggingService(errorInfo);
  }
};

// User-friendly error messages
export const getErrorMessage = (error: AppError): string => {
  const userFriendlyMessages: Record<string, string> = {
    'AUTHENTICATION_ERROR': '로그인이 필요합니다',
    'AUTHORIZATION_ERROR': '접근 권한이 없습니다',
    'VALIDATION_ERROR': '입력 정보를 확인해주세요',
    'NOT_FOUND_ERROR': '요청한 정보를 찾을 수 없습니다',
    'NETWORK_ERROR': '네트워크 연결을 확인해주세요',
    'UNKNOWN_ERROR': '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  };
  
  return userFriendlyMessages[error.code] || error.message;
};

// Error boundary fallback component props
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}