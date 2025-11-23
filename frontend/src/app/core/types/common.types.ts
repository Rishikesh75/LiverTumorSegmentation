/**
 * Core Layer - Common Types
 * Shared TypeScript types and interfaces used across layers
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E = Error> {
  success: false;
  error: E;
}

export type ImageType = 'upload' | 'output';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

