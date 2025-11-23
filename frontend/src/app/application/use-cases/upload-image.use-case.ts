/**
 * Application Layer - Upload Image Use Case
 * Handles the business logic for uploading an image
 */

import { Injectable, Inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ISegmentationRepository, SEGMENTATION_REPOSITORY_TOKEN } from '../../domain/interfaces/segmentation-repository.interface';
import { ImageUploadDto } from '../dtos/segmentation-response.dto';
import { Validators } from '../../core/utils/validators.util';
import { ERROR_MESSAGES } from '../../core/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UploadImageUseCase {
  constructor(@Inject(SEGMENTATION_REPOSITORY_TOKEN) private repository: ISegmentationRepository) {}

  execute(file: File): Observable<ImageUploadDto> {
    // Validate file
    const validation = Validators.isValidImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || ERROR_MESSAGES.INVALID_FILE_TYPE);
    }

    // Upload image through repository
    return this.repository.uploadImage(file).pipe(
      map(imageEntity => ({
        id: imageEntity.id,
        path: imageEntity.path.path,
        uploadedAt: imageEntity.uploadedAt
      }))
    );
  }
}

