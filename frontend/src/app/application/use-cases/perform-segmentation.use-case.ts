/**
 * Application Layer - Perform Segmentation Use Case
 * Handles the business logic for performing image segmentation
 */

import { Injectable, Inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ISegmentationRepository, SEGMENTATION_REPOSITORY_TOKEN } from '../../domain/interfaces/segmentation-repository.interface';
import { SegmentationEntity } from '../../domain/entities/segmentation.entity';
import { ImageEntity } from '../../domain/entities/image.entity';
import { ModelType } from '../../domain/value-objects/model-type.vo';
import { SegmentationResponseDto } from '../dtos/segmentation-response.dto';

@Injectable({
  providedIn: 'root'
})
export class PerformSegmentationUseCase {
  constructor(@Inject(SEGMENTATION_REPOSITORY_TOKEN) private repository: ISegmentationRepository) {}

  execute(imagePath: string, modelType: string): Observable<SegmentationResponseDto> {
    // Create domain entities
    const imageEntity = ImageEntity.create('temp-id', imagePath);
    const modelTypeVO = ModelType.create(modelType);
    const segmentation = SegmentationEntity.create('temp-id', imageEntity, modelTypeVO);

    // Start processing
    segmentation.startProcessing();

    // Perform segmentation through repository
    return this.repository.performSegmentation(segmentation).pipe(
      map(result => this.toDto(result))
    );
  }

  private toDto(entity: SegmentationEntity): SegmentationResponseDto {
    return {
      id: entity.id,
      originalImagePath: entity.originalImage.path.path,
      segmentedImagePath: entity.segmentedImagePath?.path || null,
      modelType: entity.modelType.value,
      status: entity.status,
      createdAt: entity.createdAt,
      completedAt: entity.completedAt || null,
      errorMessage: entity.errorMessage || null,
      processingDuration: entity.getProcessingDuration()
    };
  }
}

