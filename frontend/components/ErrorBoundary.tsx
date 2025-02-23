import React from 'react';
import { useNotification } from '../hooks/useNotification';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ error: null, errorInfo: null })}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to use error boundary functionality
export const useErrorBoundary = () => {
  const notify = useNotification();

  const handleError = (error: Error) => {
    notify.error(error.message);
    console.error('Error caught by boundary:', error);
  };

  return { handleError };
};

export default ErrorBoundary;
