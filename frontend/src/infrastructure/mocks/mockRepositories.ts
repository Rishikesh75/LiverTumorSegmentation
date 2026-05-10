import type {
  AnalyticsRepository,
  AuthRepository,
  CreateJobOptions,
  JobRepository,
  NotificationRepository,
  RepositoryBundle,
  UserProfileUpdate,
  VolumeRepository,
} from '@application/ports/repositories'
import type { Session } from '@domain/entities/session'
import type {
  AnalyticsSummary,
  SegmentationJob,
  VolumeFormat,
  VolumeMetadata,
} from '@domain/entities/segmentation'
import {
  appendNotificationLog,
  applyStoredProfile,
  ensureUserBucket,
  loadMockState,
  mergeSessionUserWithProfile,
  newId,
  nowIso,
  randomToken,
  saveMockState,
  syncJobArrays,
  userFromEmail,
} from '@infrastructure/mocks/mockStore'

function readWrite<T>(fn: (state: ReturnType<typeof loadMockState>) => T): T {
  const state = loadMockState()
  const out = fn(state)
  mergeSessionUserWithProfile(state)
  saveMockState(state)
  return out
}

export class MockAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<Session> {
    void password
    return readWrite((state) => {
      const user = userFromEmail(email)
      ensureUserBucket(state, user.id)
      const merged = applyStoredProfile(user, state.profilesByUserId[user.id])
      const session: Session = { user: merged, token: randomToken() }
      state.session = session
      return session
    })
  }

  async logout(): Promise<void> {
    readWrite((state) => {
      state.session = null
    })
  }

  async getCurrentSession(): Promise<Session | null> {
    return loadMockState().session
  }

  async updateProfile(updates: UserProfileUpdate): Promise<Session> {
    return readWrite((state) => {
      const session = state.session
      if (!session) {
        throw new Error('Not authenticated')
      }
      const id = session.user.id
      const prev = state.profilesByUserId[id] ?? {}
      state.profilesByUserId[id] = { ...prev, ...updates }
      state.session = {
        ...session,
        user: applyStoredProfile(session.user, state.profilesByUserId[id]),
      }
      return state.session
    })
  }
}

export class MockVolumeRepository implements VolumeRepository {
  async upload(files: File[], format: VolumeFormat): Promise<VolumeMetadata> {
    return readWrite((state) => {
      const session = state.session
      if (!session) {
        throw new Error('Not authenticated')
      }
      const bucket = ensureUserBucket(state, session.user.id)
      const sizeBytes = files.reduce((s, f) => s + f.size, 0)
      const displayName =
        files.length === 1 ? files[0].name : `${files.length} DICOM files`
      const meta: VolumeMetadata = {
        id: newId('vol'),
        userId: session.user.id,
        displayName,
        format,
        sizeBytes,
        fileCount: files.length,
        createdAt: nowIso(),
      }
      bucket.volumes.unshift(meta)
      return meta
    })
  }
}

export class MockJobRepository implements JobRepository {
  async createJob(
    volumeId: string,
    modelType: string,
    _options?: CreateJobOptions,
  ): Promise<SegmentationJob> {
    void _options
    return readWrite((state) => {
      const session = state.session
      if (!session) {
        throw new Error('Not authenticated')
      }
      const bucket = ensureUserBucket(state, session.user.id)
      const vol = bucket.volumes.find((v) => v.id === volumeId)
      if (!vol) {
        throw new Error('Volume not found')
      }
      const job: SegmentationJob = {
        id: newId('job'),
        userId: session.user.id,
        volumeId,
        volumeName: vol.displayName,
        modelType,
        status: 'queued',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      bucket.jobs.unshift(job)
      return job
    })
  }

  async getJob(jobId: string): Promise<SegmentationJob | null> {
    return readWrite((state) => {
      const session = state.session
      if (!session) {
        return null
      }
      const bucket = ensureUserBucket(state, session.user.id)
      const nowMs = Date.now()
      syncJobArrays(bucket, nowMs)
      return bucket.jobs.find((j) => j.id === jobId) ?? null
    })
  }

  async listJobs(): Promise<SegmentationJob[]> {
    return readWrite((state) => {
      const session = state.session
      if (!session) {
        return []
      }
      const bucket = ensureUserBucket(state, session.user.id)
      const nowMs = Date.now()
      syncJobArrays(bucket, nowMs)
      return [...bucket.jobs]
    })
  }
}

export class MockAnalyticsRepository implements AnalyticsRepository {
  async getMyAnalytics(): Promise<AnalyticsSummary> {
    const state = loadMockState()
    const session = state.session
    if (!session) {
      throw new Error('Not authenticated')
    }
    const bucket = ensureUserBucket(state, session.user.id)
    const nowMs = Date.now()
    syncJobArrays(bucket, nowMs)
    saveMockState(state)

    const jobsList = bucket.jobs
    const completed = jobsList.filter((j) => j.status === 'completed').length
    const failed = jobsList.filter((j) => j.status === 'failed').length
    const runningOrQueued = jobsList.filter(
      (j) => j.status === 'running' || j.status === 'queued',
    ).length
    const jobsByModel: Record<string, number> = {}
    for (const j of jobsList) {
      jobsByModel[j.modelType] = (jobsByModel[j.modelType] ?? 0) + 1
    }
    return {
      userId: session.user.id,
      totalUploads: bucket.volumes.length,
      totalJobs: jobsList.length,
      completedJobs: completed,
      failedJobs: failed,
      runningOrQueuedJobs: runningOrQueued,
      jobsByModel,
      recentJobs: jobsList.slice(0, 8),
    }
  }
}

export class MockNotificationRepository implements NotificationRepository {
  async notifySegmentationComplete(payload: {
    userEmail: string
    job: SegmentationJob
  }): Promise<void> {
    const entry = {
      at: nowIso(),
      userEmail: payload.userEmail,
      jobId: payload.job.id,
      volumeName: payload.job.volumeName,
      modelType: payload.job.modelType,
    }
    console.info('[mock] Segmentation result email queued', entry)
    appendNotificationLog(entry)
  }
}

export function createMockRepositories(): RepositoryBundle {
  return {
    auth: new MockAuthRepository(),
    volumes: new MockVolumeRepository(),
    jobs: new MockJobRepository(),
    analytics: new MockAnalyticsRepository(),
    notifications: new MockNotificationRepository(),
  }
}
