/**
 * Application Layer - Segmentation Facade
 * Provides a simplified interface for segmentation operations
 * Orchestrates multiple use cases
 */

import { Injectable, Inject } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { UploadImageUseCase } from '../use-cases/upload-image.use-case';
import { PerformSegmentationUseCase } from '../use-cases/perform-segmentation.use-case';
import { GetAvailableModelsUseCase } from '../use-cases/get-available-models.use-case';
import { SegmentationResponseDto, ImageUploadDto } from '../dtos/segmentation-response.dto';
import { ISegmentationRepository, SEGMENTATION_REPOSITORY_TOKEN } from '../../domain/interfaces/segmentation-repository.interface';

@Injectable({
  providedIn: 'root'
})
export class SegmentationFacade {
  constructor(
    private uploadImageUseCase: UploadImageUseCase,
    private performSegmentationUseCase: PerformSegmentationUseCase,
    private getAvailableModelsUseCase: GetAvailableModelsUseCase,
    @Inject(SEGMENTATION_REPOSITORY_TOKEN) private repository: ISegmentationRepository
  ) {}

  /**
   * Upload an image file
   */
  uploadImage(file: File): Observable<ImageUploadDto> {
    return this.uploadImageUseCase.execute(file);
  }

  /**
   * Perform segmentation on an uploaded image
   */
  performSegmentation(imagePath: string, modelType: string): Observable<SegmentationResponseDto> {
    return this.performSegmentationUseCase.execute(imagePath, modelType);
  }

  /**
   * Upload and segment in one operation
   */
  uploadAndSegment(file: File, modelType: string): Observable<SegmentationResponseDto> {
    return this.uploadImageUseCase.execute(file).pipe(
      switchMap(uploadResult => 
        this.performSegmentationUseCase.execute(uploadResult.path, modelType)
      )
    );
  }

  /**
   * Get available segmentation models
   */
  getAvailableModels(): Observable<string[]> {
    return this.getAvailableModelsUseCase.execute();
  }

  /**
   * Get image URL for display
   */
  getImageUrl(imagePath: string, type: 'upload' | 'output'): string {
    return this.repository.getImageUrl(imagePath, type);
  }
}

