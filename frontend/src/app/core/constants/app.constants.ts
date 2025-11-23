/**
 * Core Layer - Application Constants
 * Global constants used across the application
 */

export const APP_CONSTANTS = {
  APP_NAME: 'Liver Tumor Segmentation',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'],
  DEFAULT_MODEL: 'unet',
  IMAGE_UPLOAD_PATH: 'upload',
  IMAGE_OUTPUT_PATH: 'output'
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size of 10MB',
  INVALID_FILE_TYPE: 'Please select a valid image file (JPEG, PNG, BMP, or TIFF)',
  NO_FILE_SELECTED: 'Please select a file first',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  SEGMENTATION_FAILED: 'Failed to perform segmentation. Please try again.',
  MODELS_LOAD_FAILED: 'Failed to load available models',
  NO_IMAGE_UPLOADED: 'Please upload an image first'
} as const;

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'Image uploaded successfully',
  SEGMENTATION_SUCCESS: 'Segmentation completed successfully'
} as const;

