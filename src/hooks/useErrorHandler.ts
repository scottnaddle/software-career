import { useCallback, useState } from 'react';
import { AppError, handleError, logError, getErrorMessage } from '../utils/error';

interface UseErrorHandlerReturn {
  error: AppError | null;
  showError: (error: unknown) => void;
  clearError: () => void;
  isError: boolean;
  errorMessage: string;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<AppError | null>(null);

  const showError = useCallback((error: unknown) => {
    const appError = handleError(error);
    logError(appError);
    setError(appError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isError = error !== null;
  const errorMessage = error ? getErrorMessage(error) : '';

  return {
    error,
    showError,
    clearError,
    isError,
    errorMessage,
  };
};