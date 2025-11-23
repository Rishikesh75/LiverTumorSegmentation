/**
 * Application Layer - Get Available Models Use Case
 * Handles the business logic for retrieving available segmentation models
 */

import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ISegmentationRepository, SEGMENTATION_REPOSITORY_TOKEN } from '../../domain/interfaces/segmentation-repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetAvailableModelsUseCase {
  constructor(@Inject(SEGMENTATION_REPOSITORY_TOKEN) private repository: ISegmentationRepository) {}

  execute(): Observable<string[]> {
    return this.repository.getAvailableModels();
  }
}

