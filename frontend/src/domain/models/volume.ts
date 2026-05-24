export type VolumeFormat = 'nifti' | 'dicom'

export interface Volume {
  id: string
  userId: string
  displayName: string
  format: VolumeFormat
  sizeBytes: number
  fileCount: number
  createdAt: string
}
