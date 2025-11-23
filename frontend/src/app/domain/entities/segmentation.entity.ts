/**
 * Domain Layer - Segmentation Entity
 * Core domain entity representing a segmentation operation
 */

import { SegmentationStatus } from '../enums/segmentation-status.enum';
import { ModelType } from '../value-objects/model-type.vo';
import { ImagePath } from '../value-objects/image-path.vo';
import { ImageEntity } from './image.entity';

export class SegmentationEntity {
  constructor(
    private readonly _id: string,
    private readonly _originalImage: ImageEntity,
    private readonly _modelType: ModelType,
    private _status: SegmentationStatus,
    private _segmentedImagePath?: ImagePath,
    private _createdAt: Date = new Date(),
    private _completedAt?: Date,
    private _errorMessage?: string
  ) {}

  static create(
    id: string,
    originalImage: ImageEntity,
    modelType: ModelType
  ): SegmentationEntity {
    return new SegmentationEntity(
      id,
      originalImage,
      modelType,
      SegmentationStatus.PENDING
    );
  }

  get id(): string {
    return this._id;
  }

  get originalImage(): ImageEntity {
    return this._originalImage;
  }

  get modelType(): ModelType {
    return this._modelType;
  }

  get status(): SegmentationStatus {
    return this._status;
  }

  get segmentedImagePath(): ImagePath | undefined {
    return this._segmentedImagePath;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  /**
   * Business rule: Mark segmentation as completed
   */
  markAsCompleted(segmentedImagePath: string): void {
    if (this._status === SegmentationStatus.COMPLETED) {
      throw new Error('Segmentation is already completed');
    }
    this._status = SegmentationStatus.COMPLETED;
    this._segmentedImagePath = ImagePath.create(segmentedImagePath);
    this._completedAt = new Date();
    this._errorMessage = undefined;
  }

  /**
   * Business rule: Mark segmentation as failed
   */
  markAsFailed(errorMessage: string): void {
    if (this._status === SegmentationStatus.COMPLETED) {
      throw new Error('Cannot mark completed segmentation as failed');
    }
    this._status = SegmentationStatus.FAILED;
    this._errorMessage = errorMessage;
    this._completedAt = new Date();
  }

  /**
   * Business rule: Start processing
   */
  startProcessing(): void {
    if (this._status !== SegmentationStatus.PENDING) {
      throw new Error('Can only start processing from pending status');
    }
    this._status = SegmentationStatus.PROCESSING;
  }

  /**
   * Business rule: Check if segmentation is in progress
   */
  isInProgress(): boolean {
    return this._status === SegmentationStatus.PROCESSING ||
           this._status === SegmentationStatus.UPLOADING;
  }

  /**
   * Business rule: Check if segmentation is complete
   */
  isCompleted(): boolean {
    return this._status === SegmentationStatus.COMPLETED;
  }

  /**
   * Business rule: Check if segmentation has failed
   */
  hasFailed(): boolean {
    return this._status === SegmentationStatus.FAILED;
  }

  /**
   * Business rule: Calculate processing duration in seconds
   */
  getProcessingDuration(): number | null {
    if (!this._completedAt) {
      return null;
    }
    return (this._completedAt.getTime() - this._createdAt.getTime()) / 1000;
  }
}

