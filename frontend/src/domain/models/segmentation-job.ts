export interface SegmentationJob {
  id: string
  userId: string
  volumeId: string
  volumeName: string | null
  modelType: string
  status: string
  createdAt: string
  updatedAt: string
  errorMessage: string | null
  resultPreviewUrls: string[]
}

export interface CreateJobInput {
  volumeId: string
  modelType: string
  volumeDisplayName?: string
  notificationEmail?: string
}
