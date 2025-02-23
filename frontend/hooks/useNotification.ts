import { useCallback } from 'react';
import toast, { Toast, ToastOptions } from 'react-hot-toast';

interface NotificationOptions extends Partial<ToastOptions> {
  title?: string;
  description?: string;
}

interface CustomToast extends Toast {
  title?: string;
  description?: string;
}

const defaultOptions: ToastOptions = {
  duration: 5000,
  position: 'bottom-right',
  style: {
    background: '#fff',
    color: '#363636',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    ...defaultOptions.style,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
  },
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  duration: 7000,
  style: {
    ...defaultOptions.style,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
  },
};

const infoOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    ...defaultOptions.style,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
  },
};

export const useNotification = () => {
  const notify = useCallback((message: string, options?: NotificationOptions) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
    });
  }, []);

  const success = useCallback((message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      ...successOptions,
      ...options,
    });
  }, []);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      ...errorOptions,
      ...options,
    });
  }, []);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    return toast(message, {
      ...infoOptions,
      ...options,
    });
  }, []);

  const loading = useCallback((message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  const custom = useCallback(
    (
      render: (toast: CustomToast) => JSX.Element,
      options?: NotificationOptions
    ) => {
      return toast.custom(render, {
        ...defaultOptions,
        ...options,
      });
    },
    []
  );

  const promise = useCallback(
    <T>(
      promise: Promise<T>,
      {
        loading = 'Loading...',
        success = 'Success!',
        error = 'Error occurred',
      }: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((err: any) => string);
      },
      options?: NotificationOptions
    ) => {
      return toast.promise(
        promise,
        {
          loading,
          success,
          error,
        },
        {
          ...defaultOptions,
          ...options,
        }
      );
    },
    []
  );

  const handleError = useCallback((error: any) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred';
    return toast.error(message, errorOptions);
  }, []);

  const update = useCallback(
    (toastId: string, message: string, options?: NotificationOptions) => {
      return toast.loading(message, {
        id: toastId,
        ...defaultOptions,
        ...options,
      });
    },
    []
  );

  return {
    notify,
    success,
    error,
    info,
    loading,
    dismiss,
    custom,
    promise,
    handleError,
    update,
  };
};

export const darkModeStyles = {
  success: {
    style: {
      background: '#065f46',
      color: '#d1fae5',
      border: '1px solid #047857',
    },
  },
  error: {
    style: {
      background: '#7f1d1d',
      color: '#fee2e2',
      border: '1px solid #991b1b',
    },
  },
  info: {
    style: {
      background: '#1e3a8a',
      color: '#dbeafe',
      border: '1px solid #1e40af',
    },
  },
  default: {
    style: {
      background: '#1f2937',
      color: '#f3f4f6',
      border: '1px solid #374151',
    },
  },
};

export default useNotification;
