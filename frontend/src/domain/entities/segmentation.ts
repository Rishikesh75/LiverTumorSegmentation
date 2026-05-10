export type VolumeFormat = 'nifti' | 'dicom'

export type VolumeMetadata = {
  id: string
  userId: string
  displayName: string
  format: VolumeFormat
  sizeBytes: number
  fileCount: number
  createdAt: string
}

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed'

export type SegmentationJob = {
  id: string
  userId: string
  volumeId: string
  volumeName: string
  modelType: string
  status: JobStatus
  createdAt: string
  updatedAt: string
  errorMessage?: string
  /** Mock slice previews (e.g. data URLs); real API may return HTTPS URLs */
  resultPreviewUrls?: string[]
}

export type AnalyticsSummary = {
  userId: string
  totalUploads: number
  totalJobs: number
  completedJobs: number
  failedJobs: number
  runningOrQueuedJobs: number
  jobsByModel: Record<string, number>
  recentJobs: SegmentationJob[]
}

export const SEGMENTATION_MODELS = [
  'unet',
  'unet++',
  'attention',
  'trans-unet',
  'ensemble',
] as const

export type SegmentationModelType = (typeof SEGMENTATION_MODELS)[number]
