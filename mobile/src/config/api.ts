/**
 * API Configuration
 * 
 * Centralized configuration for backend API endpoints
 */

// Determine if running in development mode
const isDevelopment = __DEV__;

// API Base URL
// For physical device testing, replace localhost with your computer's local IP
// Example: 'http://192.168.1.100:3001'
export const API_BASE_URL = isDevelopment
    ? 'http://localhost:3001'  // Development
    : 'https://backend-deploy-ayush-kumar-s-projects-fa532792.vercel.app';  // Production

// API Endpoints
export const API_ENDPOINTS = {
    metadata: '/api/metadata',
    metadataByAddress: (address: string) => `/api/metadata/${address}`,
    trending: '/api/trending',
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
    return `${API_BASE_URL}${endpoint}`;
}

/**
 * Helper function to fetch with timeout
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
