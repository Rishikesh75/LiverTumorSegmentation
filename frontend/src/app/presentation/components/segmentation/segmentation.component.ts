/**
 * Presentation Layer - Segmentation Component
 * Handles user interactions and displays segmentation UI
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SegmentationFacade } from '../../../application/facades/segmentation.facade';
import { SegmentationViewModel, initialSegmentationViewModel } from '../../view-models/segmentation.view-model';
import { ERROR_MESSAGES } from '../../../core/constants/app.constants';
import { Validators } from '../../../core/utils/validators.util';

@Component({
  selector: 'app-segmentation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './segmentation.component.html',
  styleUrl: './segmentation.component.css'
})
export class SegmentationComponent implements OnInit {
  // View Model
  vm: SegmentationViewModel = { ...initialSegmentationViewModel };

  // Computed properties for template
  get selectedFile(): File | null { return this.vm.selectedFile; }
  get selectedModel(): string { return this.vm.selectedModel; }
  set selectedModel(value: string) { this.vm.selectedModel = value; }
  get availableModels(): string[] { return this.vm.availableModels; }
  get isUploading(): boolean { return this.vm.uploadState === 'loading'; }
  get isSegmenting(): boolean { return this.vm.segmentationState === 'loading'; }
  get segmentationResult(): any { return this.vm.segmentationResult; }
  get errorMessage(): string { return this.vm.errorMessage; }

  constructor(private segmentationFacade: SegmentationFacade) {}

  ngOnInit(): void {
    this.loadAvailableModels();
  }

  /**
   * Load available segmentation models
   */
  loadAvailableModels(): void {
    this.segmentationFacade.getAvailableModels().subscribe({
      next: (models) => {
        this.vm.availableModels = models;
        if (models.length > 0) {
          this.vm.selectedModel = models[0];
        }
      },
      error: (error) => {
        console.error('Error loading models:', error);
        this.vm.errorMessage = ERROR_MESSAGES.MODELS_LOAD_FAILED;
      }
    });
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = Validators.isValidImageFile(file);
    if (!validation.valid) {
      this.vm.errorMessage = ERROR_MESSAGES.INVALID_FILE_TYPE;
      this.vm.selectedFile = null;
      return;
    }

    this.vm.selectedFile = file;
    this.vm.errorMessage = '';
  }

  /**
   * Upload image and perform segmentation
   */
  uploadImage(): void {
    if (!this.vm.selectedFile) {
      this.vm.errorMessage = ERROR_MESSAGES.NO_FILE_SELECTED;
      return;
    }

    this.vm.uploadState = 'loading';
    this.vm.segmentationState = 'loading';
    this.vm.errorMessage = '';

    // Upload image
    this.segmentationFacade.uploadImage(this.vm.selectedFile).subscribe({
      next: (uploadResult) => {
        this.vm.uploadedFileName = uploadResult.path;
        this.vm.uploadState = 'success';
        
        // Perform segmentation
        this.performSegmentation();
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.vm.errorMessage = ERROR_MESSAGES.UPLOAD_FAILED;
        this.vm.uploadState = 'error';
        this.vm.segmentationState = 'idle';
      }
    });
  }

  /**
   * Perform segmentation on uploaded image
   */
  performSegmentation(): void {
    if (!this.vm.uploadedFileName) {
      this.vm.errorMessage = ERROR_MESSAGES.NO_IMAGE_UPLOADED;
      return;
    }

    this.segmentationFacade.performSegmentation(
      this.vm.uploadedFileName,
      this.vm.selectedModel
    ).subscribe({
      next: (result) => {
        this.vm.segmentationResult = result;
        this.vm.segmentationState = 'success';
      },
      error: (error) => {
        console.error('Segmentation error:', error);
        this.vm.errorMessage = ERROR_MESSAGES.SEGMENTATION_FAILED;
        this.vm.segmentationState = 'error';
      }
    });
  }

  /**
   * Get original image URL for display
   */
  getOriginalImageUrl(): string {
    if (!this.vm.uploadedFileName) return '';
    return this.segmentationFacade.getImageUrl(this.vm.uploadedFileName, 'upload');
  }

  /**
   * Get segmented image URL for display
   */
  getSegmentedImageUrl(): string {
    if (!this.vm.segmentationResult?.segmentedImagePath) return '';
    return this.segmentationFacade.getImageUrl(this.vm.segmentationResult.segmentedImagePath, 'output');
  }

  /**
   * Reset the form and state
   */
  reset(): void {
    this.vm = { ...initialSegmentationViewModel };
    this.loadAvailableModels();
  }
}

