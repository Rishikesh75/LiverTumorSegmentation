/**
 * Core Layer - Validation Utilities
 * Common validation functions used across the application
 */

import { APP_CONSTANTS } from '../constants/app.constants';

export class Validators {
  /**
   * Validates if the file is an image and within size limits
   */
  static isValidImageFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file type
    if (!APP_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return { valid: false, error: 'Invalid file type' };
    }

    // Check file size
    if (file.size > APP_CONSTANTS.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds limit' };
    }

    return { valid: true };
  }

  /**
   * Validates if a string is not empty
   */
  static isNotEmpty(value: string): boolean {
    return value !== null && value !== undefined && value.trim().length > 0;
  }

  /**
   * Validates if a value is a valid URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

