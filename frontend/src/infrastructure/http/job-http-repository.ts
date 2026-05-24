import type { CreateJobInput, SegmentationJob } from '@domain/models/segmentation-job'
import type { JobRepository } from '@domain/repositories/job-repository'
import type { HttpClient } from '@infrastructure/http/http-client'

interface JobResponseDto {
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

function mapJob(dto: JobResponseDto): SegmentationJob {
  return {
    id: dto.id,
    userId: dto.userId,
    volumeId: dto.volumeId,
    volumeName: dto.volumeName,
    modelType: dto.modelType,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    errorMessage: dto.errorMessage,
    resultPreviewUrls: dto.resultPreviewUrls ?? [],
  }
}

export function createJobHttpRepository(httpClient: HttpClient): JobRepository {
  return {
    async createJob(input: CreateJobInput): Promise<SegmentationJob> {
      const response = await httpClient.post<JobResponseDto>('/api/jobs', {
        volumeId: input.volumeId,
        modelType: input.modelType,
        volumeDisplayName: input.volumeDisplayName,
        notificationEmail: input.notificationEmail,
      })
      return mapJob(response)
    },
  }
}
