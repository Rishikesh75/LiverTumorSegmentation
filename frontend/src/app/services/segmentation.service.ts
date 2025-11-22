import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SegmentationRequest, SegmentationResponse, UploadResponse } from '../models/segmentation.model';

@Injectable({
  providedIn: 'root'
})
export class SegmentationService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  performSegmentation(request: SegmentationRequest): Observable<SegmentationResponse> {
    return this.http.post<SegmentationResponse>(`${this.apiUrl}/segment`, request);
  }

  getAvailableModels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/models`);
  }

  getImageUrl(fileName: string, type: 'upload' | 'output'): string {
    return `${this.apiUrl}/images/${fileName}?type=${type}`;
  }
}
