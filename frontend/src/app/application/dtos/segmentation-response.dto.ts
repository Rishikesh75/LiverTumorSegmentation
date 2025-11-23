/**
 * Application Layer - Segmentation Response DTO
 * Data transfer object for segmentation responses
 */

export interface SegmentationResponseDto {
  id: string;
  originalImagePath: string;
  segmentedImagePath: string | null;
  modelType: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
  processingDuration: number | null;
}

export interface ImageUploadDto {
  id: string;
  path: string;
  uploadedAt: Date;
}

