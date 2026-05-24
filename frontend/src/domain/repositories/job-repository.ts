import type { CreateJobInput, SegmentationJob } from '@domain/models/segmentation-job'

export interface JobRepository {
  createJob(input: CreateJobInput): Promise<SegmentationJob>
}
