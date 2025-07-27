import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { 
  validateForm, 
  safeValidate, 
  validateWithCustomErrors,
  formatValidationErrors,
  hasFieldError,
  getFieldError
} from '../validation';
import { 
  userSchema, 
  loginSchema, 
  expertApplicationSchema 
} from '../../schemas/validation';

describe('Validation Utils', () => {
  describe('validateForm', () => {
    it('should return success true for valid data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = validateForm(loginSchema, validData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    it('should return success false with errors for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const result = validateForm(loginSchema, invalidData);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.email).toContain('유효한 이메일');
      expect(result.errors?.password).toContain('비밀번호를 입력');
    });

    it('should handle nested validation errors', () => {
      const invalidExpertData = {
        name: 'A', // Too short
        email: 'invalid-email',
        phone: 'invalid-phone',
        bio: 'Short', // Too short
        specialties: [], // Empty array
        rate: -1 // Negative number
      };

      const result = validateForm(expertApplicationSchema, invalidExpertData);

      expect(result.success).toBe(false);
      expect(result.errors?.name).toContain('최소 2글자');
      expect(result.errors?.email).toContain('유효한 이메일');
      expect(result.errors?.phone).toContain('올바른 전화번호');
      expect(result.errors?.bio).toContain('최소 10글자');
      expect(result.errors?.specialties).toContain('최소 하나');
      expect(result.errors?.rate).toContain('0원 이상');
    });
  });

  describe('safeValidate', () => {
    it('should return parsed data for valid input', () => {
      const validData = {
        email: 'test@example.com',
        name: 'Test User',
        account_type: 'individual'
      };

      const result = safeValidate(userSchema, validData);

      expect(result).toEqual(validData);
    });

    it('should return null for invalid input', () => {
      const invalidData = {
        email: 'invalid-email',
        name: ''
      };

      const result = safeValidate(userSchema, invalidData);

      expect(result).toBe(null);
    });
  });

  describe('validateWithCustomErrors', () => {
    it('should use custom error messages when provided', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const customErrors = {
        email: '사용자 정의 이메일 오류',
        password: '사용자 정의 비밀번호 오류'
      };

      const result = validateWithCustomErrors(loginSchema, invalidData, customErrors);

      expect(result.success).toBe(false);
      expect(result.errors?.email).toBe('사용자 정의 이메일 오류');
      expect(result.errors?.password).toBe('사용자 정의 비밀번호 오류');
    });

    it('should fall back to default errors when custom errors are not provided', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const customErrors = {
        email: '사용자 정의 이메일 오류'
        // password error not provided
      };

      const result = validateWithCustomErrors(loginSchema, invalidData, customErrors);

      expect(result.success).toBe(false);
      expect(result.errors?.email).toBe('사용자 정의 이메일 오류');
      expect(result.errors?.password).toContain('비밀번호를 입력'); // Default error
    });
  });

  describe('formatValidationErrors', () => {
    it('should format multiple errors into a single string', () => {
      const errors = {
        email: '유효한 이메일을 입력해주세요',
        password: '비밀번호를 입력해주세요',
        name: '이름을 입력해주세요'
      };

      const result = formatValidationErrors(errors);

      expect(result).toBe('유효한 이메일을 입력해주세요, 비밀번호를 입력해주세요, 이름을 입력해주세요');
    });

    it('should handle single error', () => {
      const errors = {
        email: '유효한 이메일을 입력해주세요'
      };

      const result = formatValidationErrors(errors);

      expect(result).toBe('유효한 이메일을 입력해주세요');
    });

    it('should handle empty errors object', () => {
      const errors = {};

      const result = formatValidationErrors(errors);

      expect(result).toBe('');
    });
  });

  describe('hasFieldError', () => {
    it('should return true when field has error', () => {
      const errors = {
        email: '유효한 이메일을 입력해주세요',
        password: '비밀번호를 입력해주세요'
      };

      expect(hasFieldError(errors, 'email')).toBe(true);
      expect(hasFieldError(errors, 'password')).toBe(true);
    });

    it('should return false when field has no error', () => {
      const errors = {
        email: '유효한 이메일을 입력해주세요'
      };

      expect(hasFieldError(errors, 'password')).toBe(false);
      expect(hasFieldError(errors, 'name')).toBe(false);
    });

    it('should return false when errors is undefined', () => {
      expect(hasFieldError(undefined, 'email')).toBe(false);
    });
  });

  describe('getFieldError', () => {
    it('should return error message for field with error', () => {
      const errors = {
        email: '유효한 이메일을 입력해주세요',
        password: '비밀번호를 입력해주세요'
      };

      expect(getFieldError(errors, 'email')).toBe('유효한 이메일을 입력해주세요');
      expect(getFieldError(errors, 'password')).toBe('비밀번호를 입력해주세요');
    });

    it('should return undefined for field without error', () => {
      const errors = {
        email: '유효한 이메일을 입력해주세요'
      };

      expect(getFieldError(errors, 'password')).toBeUndefined();
      expect(getFieldError(errors, 'name')).toBeUndefined();
    });

    it('should return undefined when errors is undefined', () => {
      expect(getFieldError(undefined, 'email')).toBeUndefined();
    });
  });
});