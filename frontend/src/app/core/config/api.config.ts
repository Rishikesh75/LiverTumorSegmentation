/**
 * Core Layer - API Configuration
 * Contains application-wide API configuration settings
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    UPLOAD: '/upload',
    SEGMENT: '/segment',
    MODELS: '/models',
    IMAGES: '/images'
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
} as const;

export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;

