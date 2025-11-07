import { toast } from 'sonner@2.0.3';

export type ErrorType = 'network' | 'database' | 'validation' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
}

/**
 * Parse error and determine its type
 */
export function parseError(error: unknown): AppError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Koneksi terputus. Periksa internet Anda.',
      originalError: error,
      retryable: true,
    };
  }

  // Response errors
  if (error instanceof Response) {
    if (error.status >= 500) {
      return {
        type: 'database',
        message: 'Server sedang mengalami gangguan.',
        retryable: true,
      };
    } else if (error.status === 404) {
      return {
        type: 'database',
        message: 'Data tidak ditemukan.',
        retryable: false,
      };
    } else if (error.status === 401 || error.status === 403) {
      return {
        type: 'validation',
        message: 'Akses ditolak. Silakan login kembali.',
        retryable: false,
      };
    }
  }

  // Database/Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any;
    if (dbError.code === 'PGRST116') {
      return {
        type: 'database',
        message: 'Tabel tidak ditemukan.',
        retryable: false,
      };
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.toLowerCase().includes('network')) {
      return {
        type: 'network',
        message: 'Masalah koneksi jaringan.',
        originalError: error,
        retryable: true,
      };
    }
    
    if (error.message.toLowerCase().includes('timeout')) {
      return {
        type: 'network',
        message: 'Permintaan timeout. Koneksi terlalu lambat.',
        originalError: error,
        retryable: true,
      };
    }

    return {
      type: 'unknown',
      message: error.message || 'Terjadi kesalahan.',
      originalError: error,
      retryable: true,
    };
  }

  // String errors
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      retryable: true,
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: 'Terjadi kesalahan yang tidak diketahui.',
    retryable: true,
  };
}

/**
 * Handle error with toast notification
 */
export function handleError(error: unknown, context?: string): AppError {
  const appError = parseError(error);
  
  // Log to console for debugging
  console.error(`[${context || 'Error'}]:`, appError.originalError || error);

  // Show toast notification
  const toastMessage = context 
    ? `${context}: ${appError.message}`
    : appError.message;

  if (appError.retryable) {
    toast.error(toastMessage, {
      duration: 5000,
      action: {
        label: 'Coba Lagi',
        onClick: () => window.location.reload(),
      },
    });
  } else {
    toast.error(toastMessage, {
      duration: 5000,
    });
  }

  return appError;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  onRetry?: (attempt: number) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        if (onRetry) {
          onRetry(attempt + 1);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Show offline notification
 */
export function showOfflineNotification() {
  toast.error('Tidak ada koneksi internet', {
    duration: Infinity,
    action: {
      label: 'Refresh',
      onClick: () => {
        if (navigator.onLine) {
          window.location.reload();
        } else {
          toast.error('Masih tidak ada koneksi');
        }
      },
    },
  });
}

/**
 * Show online notification
 */
export function showOnlineNotification() {
  toast.success('Koneksi kembali!', {
    duration: 3000,
    action: {
      label: 'Refresh',
      onClick: () => window.location.reload(),
    },
  });
}
