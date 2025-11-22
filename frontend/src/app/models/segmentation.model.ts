export interface SegmentationRequest {
  imagePath: string;
  modelType: string;
}

export interface SegmentationResponse {
  message: string;
  segmentedImagePath: string;
  originalImagePath: string;
  success: boolean;
  modelUsed: string;
}

export interface UploadResponse {
  fileName: string;
  message: string;
}

