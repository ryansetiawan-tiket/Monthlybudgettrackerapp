/**
 * API request utilities with standardized error handling
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Generic API request with timeout and error handling
 */
export const apiRequest = async <T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || response.statusText,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error: any) {
    if (error instanceof APIError) throw error;
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408);
    }
    throw error;
  }
};

/**
 * GET request helper
 */
export const apiGet = <T = any>(url: string, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, { ...options, method: 'GET' });

/**
 * POST request helper
 */
export const apiPost = <T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(data),
  });

/**
 * PUT request helper
 */
export const apiPut = <T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(data),
  });

/**
 * DELETE request helper
 */
export const apiDelete = <T = any>(url: string, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, { ...options, method: 'DELETE' });

/**
 * Build API URL with base URL from environment
 */
export const buildApiUrl = (endpoint: string, projectId: string): string => {
  const baseEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1${baseEndpoint}`;
};

/**
 * Get base URL for API calls
 */
export const getBaseUrl = (projectId: string): string => {
  return `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1`;
};

/**
 * Create Authorization header with bearer token
 */
export const createAuthHeaders = (token: string): HeadersInit => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
