import type {
  CreateJobOptions,
  JobRepository,
} from '@application/ports/repositories'
import type { SegmentationJob } from '@domain/entities/segmentation'

export async function createSegmentationJob(
  jobs: JobRepository,
  volumeId: string,
  modelType: string,
  options?: CreateJobOptions,
): Promise<SegmentationJob> {
  return jobs.createJob(volumeId, modelType, options)
}
