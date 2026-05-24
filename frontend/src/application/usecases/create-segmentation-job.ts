import type { CreateJobInput, SegmentationJob } from '@domain/models/segmentation-job'
import type { JobRepository } from '@domain/repositories/job-repository'

export function createCreateSegmentationJobUseCase(jobRepository: JobRepository) {
  return (input: CreateJobInput): Promise<SegmentationJob> => jobRepository.createJob(input)
}
