/**
 * Infrastructure Layer - Segmentation Repository
 * Main repository implementation that can be extended with caching, etc.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISegmentationRepository } from '../../domain/interfaces/segmentation-repository.interface';
import { SegmentationEntity } from '../../domain/entities/segmentation.entity';
import { ImageEntity } from '../../domain/entities/image.entity';
import { HttpSegmentationService } from '../services/http-segmentation.service';

@Injectable({
  providedIn: 'root'
})
export class SegmentationRepository implements ISegmentationRepository {
  constructor(private httpService: HttpSegmentationService) {}

  uploadImage(file: File): Observable<ImageEntity> {
    return this.httpService.uploadImage(file);
  }

  performSegmentation(segmentation: SegmentationEntity): Observable<SegmentationEntity> {
    return this.httpService.performSegmentation(segmentation);
  }

  getAvailableModels(): Observable<string[]> {
    return this.httpService.getAvailableModels();
  }

  getImageUrl(imagePath: string, type: 'upload' | 'output'): string {
    return this.httpService.getImageUrl(imagePath, type);
  }
}

