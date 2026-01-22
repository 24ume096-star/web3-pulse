/**
 * API Configuration for Web App
 * 
 * Centralized configuration for backend API endpoints
 */

// API Base URL - uses environment variable or defaults
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://backend-deploy-ayush-kumar-s-projects-fa532792.vercel.app';

// API Endpoints
export const API_ENDPOINTS = {
  metadata: '/api/metadata',
  metadataByAddress: (address: string) => `/api/metadata/${address}`,
  trending: '/api/trending',
  markets: '/api/markets',
  health: '/api/health',
};

// Request Configuration
export const API_CONFIG = {
  timeout: 10000,  // 10 seconds
  retries: 3,
  retryDelay: 1000,  // 1 second
};

// Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  metadata: 2 * 60 * 1000,  // 2 minutes
  trending: 5 * 60 * 1000,  // 5 minutes
};

/**
 * Helper function to build full API URL
 */
export function buildApiUrl(endpoint: string): string {
  // Ensure we don't have double slashes
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
}

/**
 * Helper function to fetch with timeout and error handling
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch API with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = API_CONFIG.retries
): Promise<Response> {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}
