import { useState, useCallback } from 'react';

interface ErrorState {
  message: string | null;
  code?: string;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({ message: null });

  const handleError = useCallback((err: unknown) => {
    console.error('Error occurred:', err);

    if (err instanceof Error) {
      setError({ message: err.message });
    } else if (typeof err === 'string') {
      setError({ message: err });
    } else {
      setError({ message: 'An unexpected error occurred' });
    }
  }, []);

  const clearError = useCallback(() => {
    setError({ message: null });
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};
