import { z } from 'zod';

// Validation utility functions
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Safe validation that returns null on error
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): T | null => {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
};

// Validation with custom error messages
export const validateWithCustomErrors = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown, 
  customErrors?: Record<string, string>
): { success: boolean; data?: T; errors?: Record<string, string> } => {
  const result = validateForm(schema, data);
  
  if (!result.success && result.errors && customErrors) {
    const updatedErrors = { ...result.errors };
    Object.keys(customErrors).forEach(key => {
      if (updatedErrors[key]) {
        updatedErrors[key] = customErrors[key];
      }
    });
    return { ...result, errors: updatedErrors };
  }
  
  return result;
};

// Utility to format validation errors for display
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join(', ');
};

// Utility to check if a field has errors
export const hasFieldError = (errors: Record<string, string> | undefined, fieldName: string): boolean => {
  return errors ? fieldName in errors : false;
};

// Utility to get field error message
export const getFieldError = (errors: Record<string, string> | undefined, fieldName: string): string | undefined => {
  return errors?.[fieldName];
};