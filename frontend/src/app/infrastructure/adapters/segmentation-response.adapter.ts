/**
 * Infrastructure Layer - Segmentation Response Adapter
 * Converts API responses to domain entities
 */

import { SegmentationEntity } from '../../domain/entities/segmentation.entity';
import { ImageEntity } from '../../domain/entities/image.entity';
import { ModelType } from '../../domain/value-objects/model-type.vo';
import { ImagePath } from '../../domain/value-objects/image-path.vo';
import { SegmentationStatus } from '../../domain/enums/segmentation-status.enum';

export interface ApiSegmentationResponse {
  message: string;
  segmentedImagePath: string;
  originalImagePath: string;
  success: boolean;
  modelUsed: string;
}

export interface ApiUploadResponse {
  fileName: string;
  message: string;
}

export class SegmentationResponseAdapter {
  /**
   * Convert API upload response to ImageEntity
   */
  static toImageEntity(response: ApiUploadResponse): ImageEntity {
    return ImageEntity.create(
      this.generateId(),
      response.fileName,
      new Date()
    );
  }

  /**
   * Convert API segmentation response to SegmentationEntity
   */
  static toSegmentationEntity(
    response: ApiSegmentationResponse,
    originalImage: ImageEntity
  ): SegmentationEntity {
    const modelType = ModelType.create(response.modelUsed);
    const segmentation = SegmentationEntity.create(
      this.generateId(),
      originalImage,
      modelType
    );

    if (response.success) {
      segmentation.markAsCompleted(response.segmentedImagePath);
    } else {
      segmentation.markAsFailed(response.message);
    }

    return segmentation;
  }

  /**
   * Generate a unique ID (simple implementation)
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

