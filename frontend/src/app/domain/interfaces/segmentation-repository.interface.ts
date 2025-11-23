/**
 * Domain Layer - Segmentation Repository Interface
 * Defines the contract for segmentation data operations
 * Infrastructure layer must implement this interface
 */

import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SegmentationEntity } from '../entities/segmentation.entity';
import { ImageEntity } from '../entities/image.entity';

export interface ISegmentationRepository {
  /**
   * Upload an image file
   */
  uploadImage(file: File): Observable<ImageEntity>;

  /**
   * Perform segmentation on an uploaded image
   */
  performSegmentation(segmentation: SegmentationEntity): Observable<SegmentationEntity>;

  /**
   * Get available segmentation models
   */
  getAvailableModels(): Observable<string[]>;

  /**
   * Get image URL for display
   */
  getImageUrl(imagePath: string, type: 'upload' | 'output'): string;
}

/**
 * Injection token for ISegmentationRepository
 * Use this token with @Inject() decorator for dependency injection
 */
export const SEGMENTATION_REPOSITORY_TOKEN = new InjectionToken<ISegmentationRepository>(
  'ISegmentationRepository'
);

