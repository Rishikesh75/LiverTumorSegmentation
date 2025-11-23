/**
 * Core Layer - Application Providers
 * Configures dependency injection for the entire application
 */

import { Provider } from '@angular/core';
import { SEGMENTATION_REPOSITORY_TOKEN } from '../../domain/interfaces/segmentation-repository.interface';
import { SegmentationRepository } from '../../infrastructure/repositories/segmentation.repository';

/**
 * Provide the implementation of ISegmentationRepository
 * This allows us to swap implementations without changing the application layer
 */
export const SEGMENTATION_REPOSITORY_PROVIDER: Provider = {
  provide: SEGMENTATION_REPOSITORY_TOKEN,
  useClass: SegmentationRepository
};

/**
 * All application providers
 */
export const APP_PROVIDERS: Provider[] = [
  SEGMENTATION_REPOSITORY_PROVIDER
];

