const MOCK_JOBS_KEY = 'liver-tumor-segmentation-mock-jobs-v1'

import type { CreateJobInput, SegmentationJob } from '@domain/models/segmentation-job'
import type { JobRepository } from '@domain/repositories/job-repository'

function readJobs(): SegmentationJob[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(MOCK_JOBS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as SegmentationJob[]
  } catch {
    return []
  }
}

function writeJobs(jobs: SegmentationJob[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MOCK_JOBS_KEY, JSON.stringify(jobs))
}

export function createJobMockRepository(): JobRepository {
  return {
    async createJob(input: CreateJobInput): Promise<SegmentationJob> {
      await new Promise((resolve) => setTimeout(resolve, 600))

      const now = new Date().toISOString()
      const job: SegmentationJob = {
        id: `mock-job-${Date.now()}`,
        userId: 'mock-user-1',
        volumeId: input.volumeId,
        volumeName: input.volumeDisplayName ?? null,
        modelType: input.modelType,
        status: 'queued',
        createdAt: now,
        updatedAt: now,
        errorMessage: null,
        resultPreviewUrls: [],
      }

      const jobs = readJobs()
      jobs.unshift(job)
      writeJobs(jobs)

      return job
    },
  }
}
