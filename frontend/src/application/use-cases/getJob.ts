import type { JobRepository } from '@application/ports/repositories'
import type { SegmentationJob } from '@domain/entities/segmentation'

export async function getJob(
  jobs: JobRepository,
  jobId: string,
): Promise<SegmentationJob | null> {
  return jobs.getJob(jobId)
}
