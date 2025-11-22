import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SegmentationService } from '../../services/segmentation.service';
import { SegmentationResponse } from '../../models/segmentation.model';

@Component({
  selector: 'app-segmentation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './segmentation.component.html',
  styleUrl: './segmentation.component.css'
})
export class SegmentationComponent implements OnInit {
  selectedFile: File | null = null;
  uploadedFileName: string = '';
  selectedModel: string = 'unet';
  availableModels: string[] = [];
  isUploading: boolean = false;
  isSegmenting: boolean = false;
  segmentationResult: SegmentationResponse | null = null;
  errorMessage: string = '';

  constructor(private segmentationService: SegmentationService) {}

  ngOnInit(): void {
    this.loadAvailableModels();
  }

  loadAvailableModels(): void {
    this.segmentationService.getAvailableModels().subscribe({
      next: (models) => {
        this.availableModels = models;
        if (models.length > 0) {
          this.selectedModel = models[0];
        }
      },
      error: (error) => {
        console.error('Error loading models:', error);
        this.errorMessage = 'Failed to load available models';
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Please select a valid image file';
        this.selectedFile = null;
      }
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';

    this.segmentationService.uploadImage(this.selectedFile).subscribe({
      next: (response) => {
        this.uploadedFileName = response.fileName;
        this.isUploading = false;
        this.performSegmentation();
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.errorMessage = 'Failed to upload image';
        this.isUploading = false;
      }
    });
  }

  performSegmentation(): void {
    if (!this.uploadedFileName) {
      this.errorMessage = 'Please upload an image first';
      return;
    }

    this.isSegmenting = true;
    this.errorMessage = '';

    const request = {
      imagePath: this.uploadedFileName,
      modelType: this.selectedModel
    };

    this.segmentationService.performSegmentation(request).subscribe({
      next: (response) => {
        this.segmentationResult = response;
        this.isSegmenting = false;
      },
      error: (error) => {
        console.error('Segmentation error:', error);
        this.errorMessage = 'Failed to perform segmentation';
        this.isSegmenting = false;
      }
    });
  }

  getOriginalImageUrl(): string {
    if (!this.uploadedFileName) return '';
    return this.segmentationService.getImageUrl(this.uploadedFileName, 'upload');
  }

  getSegmentedImageUrl(): string {
    if (!this.segmentationResult?.segmentedImagePath) return '';
    return this.segmentationService.getImageUrl(this.segmentationResult.segmentedImagePath, 'output');
  }

  reset(): void {
    this.selectedFile = null;
    this.uploadedFileName = '';
    this.segmentationResult = null;
    this.errorMessage = '';
  }
}
