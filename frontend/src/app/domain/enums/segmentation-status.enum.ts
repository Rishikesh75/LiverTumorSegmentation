/**
 * Domain Layer - Segmentation Status Enum
 * Represents the various states of a segmentation process
 */

export enum SegmentationStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

