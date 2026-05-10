import type { JobRepository } from '@application/ports/repositories'
import type { SegmentationJob } from '@domain/entities/segmentation'

export async function listJobs(
  jobs: JobRepository,
): Promise<SegmentationJob[]> {
  return jobs.listJobs()
}
