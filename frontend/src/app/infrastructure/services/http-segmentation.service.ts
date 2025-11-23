/**
 * Infrastructure Layer - HTTP Segmentation Service
 * Implements the ISegmentationRepository interface using HTTP
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ISegmentationRepository } from '../../domain/interfaces/segmentation-repository.interface';
import { SegmentationEntity } from '../../domain/entities/segmentation.entity';
import { ImageEntity } from '../../domain/entities/image.entity';
import { API_CONFIG } from '../../core/config/api.config';
import { 
  SegmentationResponseAdapter, 
  ApiSegmentationResponse, 
  ApiUploadResponse 
} from '../adapters/segmentation-response.adapter';

@Injectable({
  providedIn: 'root'
})
export class HttpSegmentationService implements ISegmentationRepository {
  private readonly baseUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  /**
   * Upload an image file to the server
   */
  uploadImage(file: File): Observable<ImageEntity> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiUploadResponse>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.UPLOAD}`, formData)
      .pipe(
        map(response => SegmentationResponseAdapter.toImageEntity(response))
      );
  }

  /**
   * Perform segmentation on an uploaded image
   */
  performSegmentation(segmentation: SegmentationEntity): Observable<SegmentationEntity> {
    const request = {
      imagePath: segmentation.originalImage.path.path,
      modelType: segmentation.modelType.value
    };

    return this.http
      .post<ApiSegmentationResponse>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SEGMENT}`, request)
      .pipe(
        map(response => SegmentationResponseAdapter.toSegmentationEntity(
          response,
          segmentation.originalImage
        ))
      );
  }

  /**
   * Get available segmentation models from the server
   */
  getAvailableModels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.MODELS}`);
  }

  /**
   * Get image URL for display
   */
  getImageUrl(imagePath: string, type: 'upload' | 'output'): string {
    return `${this.baseUrl}${API_CONFIG.ENDPOINTS.IMAGES}/${imagePath}?type=${type}`;
  }
}

