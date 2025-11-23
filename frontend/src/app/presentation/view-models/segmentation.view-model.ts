/**
 * Presentation Layer - Segmentation View Model
 * Manages the state for the segmentation component
 */

import { SegmentationResponseDto } from '../../application/dtos/segmentation-response.dto';
import { LoadingState } from '../../core/types/common.types';

export interface SegmentationViewModel {
  selectedFile: File | null;
  uploadedFileName: string;
  selectedModel: string;
  availableModels: string[];
  uploadState: LoadingState;
  segmentationState: LoadingState;
  segmentationResult: SegmentationResponseDto | null;
  errorMessage: string;
}

export const initialSegmentationViewModel: SegmentationViewModel = {
  selectedFile: null,
  uploadedFileName: '',
  selectedModel: 'unet',
  availableModels: [],
  uploadState: 'idle',
  segmentationState: 'idle',
  segmentationResult: null,
  errorMessage: ''
};

