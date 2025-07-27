import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  NetworkError,
  handleError,
  logError,
  getErrorMessage
} from '../error';

describe('Error Utils', () => {
  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError('Test message', 'TEST_CODE', 400);

      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should have default values', () => {
      const error = new AppError('Test message', 'TEST_CODE');

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error', () => {
      const error = new ValidationError('Validation failed', 'email');

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe('email');
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error with default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('인증이 필요합니다');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should create an authentication error with custom message', () => {
      const error = new AuthenticationError('Custom auth error');

      expect(error.message).toBe('Custom auth error');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('should create an authorization error', () => {
      const error = new AuthorizationError();

      expect(error.message).toBe('권한이 없습니다');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('요청한 리소스를 찾을 수 없습니다');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('NetworkError', () => {
    it('should create a network error', () => {
      const error = new NetworkError();

      expect(error.message).toBe('네트워크 오류가 발생했습니다');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('handleError', () => {
    it('should return AppError as-is', () => {
      const appError = new AppError('Test message', 'TEST_CODE');
      const result = handleError(appError);

      expect(result).toBe(appError);
    });

    it('should convert generic Error to AppError', () => {
      const genericError = new Error('Generic error');
      const result = handleError(genericError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Generic error');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.statusCode).toBe(500);
    });

    it('should handle unknown error types', () => {
      const unknownError = 'String error';
      const result = handleError(unknownError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('알 수 없는 오류가 발생했습니다');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('logError', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true);
      console.error = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should log error in development mode', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400);
      const context = { userId: '123', action: 'test' };

      logError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        'Error logged:',
        expect.objectContaining({
          name: 'AppError',
          message: 'Test error',
          code: 'TEST_CODE',
          statusCode: 400,
          context,
          timestamp: expect.any(String),
        })
      );
    });

    it('should not log in production mode', () => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('PROD', true);
      
      const error = new AppError('Test error', 'TEST_CODE');
      logError(error);

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message for known error codes', () => {
      const authError = new AuthenticationError();
      expect(getErrorMessage(authError)).toBe('로그인이 필요합니다');

      const authzError = new AuthorizationError();
      expect(getErrorMessage(authzError)).toBe('접근 권한이 없습니다');

      const validationError = new ValidationError('Validation failed');
      expect(getErrorMessage(validationError)).toBe('입력 정보를 확인해주세요');

      const notFoundError = new NotFoundError();
      expect(getErrorMessage(notFoundError)).toBe('요청한 정보를 찾을 수 없습니다');

      const networkError = new NetworkError();
      expect(getErrorMessage(networkError)).toBe('네트워크 연결을 확인해주세요');
    });

    it('should return original message for unknown error codes', () => {
      const unknownError = new AppError('Custom error message', 'CUSTOM_CODE');
      expect(getErrorMessage(unknownError)).toBe('Custom error message');
    });

    it('should return default message for unknown error codes', () => {
      const unknownError = new AppError('Some error', 'UNKNOWN_ERROR');
      expect(getErrorMessage(unknownError)).toBe('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요');
    });
  });
});