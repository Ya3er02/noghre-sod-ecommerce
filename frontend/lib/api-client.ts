import { env } from './env';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends APIError {
  constructor(
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * Enhanced fetch with error handling, timeout, and retry logic
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeout = 30000, // 30 seconds
    retry = 3,
    retryDelay = 1000,
    headers = {},
    ...fetchOptions
  } = options;

  const baseURL = env.VITE_CLIENT_TARGET || 'http://localhost:4000';
  const url = `${baseURL}${endpoint}`;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retry; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        switch (response.status) {
          case 401:
            throw new AuthenticationError(errorData.message);
          case 400:
            throw new ValidationError(
              errorData.message || 'Validation failed',
              errorData.errors
            );
          case 404:
            throw new APIError(404, 'Resource not found');
          case 429:
            throw new APIError(429, 'Too many requests');
          case 500:
            throw new APIError(500, 'Internal server error');
          default:
            throw new APIError(
              response.status,
              errorData.message || `HTTP ${response.status}`
            );
        }
      }

      // Parse response
      const data = await response.json();
      return data as T;

    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors or auth errors
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }

      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new NetworkError('Request timeout');
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new NetworkError();
      }

      // Wait before retry (exponential backoff)
      if (attempt < retry - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new NetworkError('Request failed');
}

/**
 * Convenience methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
