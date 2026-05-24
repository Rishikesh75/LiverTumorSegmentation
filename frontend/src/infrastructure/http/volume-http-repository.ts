import { UploadError } from '@domain/models/upload-error'
import type { Volume, VolumeFormat } from '@domain/models/volume'
import type { VolumeRepository } from '@domain/repositories/volume-repository'
import type { HttpClient } from '@infrastructure/http/http-client'

interface VolumeResponseDto {
  id: string
  userId: string
  displayName: string
  format: string
  sizeBytes: number
  fileCount: number
  createdAt: string
}

function mapVolume(dto: VolumeResponseDto): Volume {
  return {
    id: dto.id,
    userId: dto.userId,
    displayName: dto.displayName,
    format: dto.format as VolumeFormat,
    sizeBytes: dto.sizeBytes,
    fileCount: dto.fileCount,
    createdAt: dto.createdAt,
  }
}

export function createVolumeHttpRepository(httpClient: HttpClient): VolumeRepository {
  return {
    async uploadLocalFile(file: File, format: VolumeFormat): Promise<Volume> {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('format', format)

        const response = await httpClient.postFormData<VolumeResponseDto>(
          '/api/volumes',
          formData,
        )
        return mapVolume(response)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to upload volume.'
        throw new UploadError(message)
      }
    },
  }
}
