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
  JobStatus,
  SegmentationJob,
  VolumeFormat,
  VolumeMetadata,
} from '@domain/entities/segmentation'
import type { User } from '@domain/entities/user'
import { createHttpClient } from '@infrastructure/http/createHttpClient'
import type { HttpClient } from '@infrastructure/http/types'

type SessionMeDto = {
  user: {
    id: string
    email: string
    displayName?: string | null
    organization?: string | null
  }
  token: string
}

type VolumeResponseDto = {
  id: string
  userId: string
  displayName: string
  format: VolumeFormat
  sizeBytes: number
  fileCount: number
  createdAt: string
}

type JobResponseDto = {
  id: string
  userId: string
  volumeId: string
  volumeName: string
  modelType: string
  status: JobStatus
  createdAt: string
  updatedAt: string
  errorMessage?: string | null
  resultPreviewUrls?: string[] | null
}

type AnalyticsResponseDto = {
  userId: string
  totalUploads: number
  totalJobs: number
  completedJobs: number
  failedJobs: number
  runningOrQueuedJobs: number
  jobsByModel: Record<string, number>
  recentJobs: JobResponseDto[]
}

function mapUser(dto: SessionMeDto['user']): User {
  return {
    id: dto.id,
    email: dto.email,
    ...(dto.displayName != null && dto.displayName !== ''
      ? { displayName: dto.displayName }
      : {}),
    ...(dto.organization != null && dto.organization !== ''
      ? { organization: dto.organization }
      : {}),
  }
}

function mapSession(dto: SessionMeDto): Session {
  return { user: mapUser(dto.user), token: dto.token }
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
    ...(dto.errorMessage ? { errorMessage: dto.errorMessage } : {}),
    ...(dto.resultPreviewUrls && dto.resultPreviewUrls.length > 0
      ? { resultPreviewUrls: dto.resultPreviewUrls }
      : {}),
  }
}

export class HttpAuthRepository implements AuthRepository {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async login(email: string, password: string): Promise<Session> {
    const dto = await this.http.postJson<SessionMeDto>('/api/auth/login', {
      email,
      password,
    })
    return mapSession(dto)
  }

  async logout(): Promise<void> {
    await this.http.postExpectNoContent('/api/auth/logout')
  }

  async getCurrentSession(): Promise<Session | null> {
    const dto = await this.http.getJsonAllowUnauthorized<SessionMeDto>(
      '/api/auth/me',
    )
    return dto ? mapSession(dto) : null
  }

  async updateProfile(updates: UserProfileUpdate): Promise<Session> {
    const dto = await this.http.patchJson<SessionMeDto>('/api/users/me', {
      displayName: updates.displayName ?? null,
      organization: updates.organization ?? null,
    })
    return mapSession(dto)
  }
}

class HttpVolumeRepository implements VolumeRepository {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async upload(files: File[], format: VolumeFormat): Promise<VolumeMetadata> {
    const dto = await this.http.getJsonAllowUnauthorized<SessionMeDto>(
      '/api/auth/me',
    )
    if (!dto) {
      throw new Error('Not authenticated')
    }
    if (files.length < 1) {
      throw new Error('At least one file is required')
    }
    const formData = new FormData()
    formData.append('file', files[0])
    for (let i = 1; i < files.length; i += 1) {
      formData.append('files', files[i])
    }
    formData.append('format', format)
    const res = await this.http.postFormData<VolumeResponseDto>(
      '/api/volumes',
      formData,
    )
    return {
      id: res.id,
      userId: res.userId,
      displayName: res.displayName,
      format: res.format,
      sizeBytes: res.sizeBytes,
      fileCount: res.fileCount,
      createdAt: res.createdAt,
    }
  }
}

class HttpJobRepository implements JobRepository {
  private readonly http: HttpClient
  private readonly apiBase: string

  constructor(http: HttpClient, apiBase: string) {
    this.http = http
    this.apiBase = apiBase
  }

  private async getJsonHandle404<T>(path: string): Promise<T | null> {
    const res = await fetch(`${this.apiBase}${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (res.status === 404) {
      return null
    }
    if (!res.ok) {
      throw new Error(`GET ${path} failed: ${res.status}`)
    }
    return res.json() as Promise<T>
  }

  async createJob(
    volumeId: string,
    modelType: string,
    options?: CreateJobOptions,
  ): Promise<SegmentationJob> {
    const dto = await this.http.getJsonAllowUnauthorized<SessionMeDto>(
      '/api/auth/me',
    )
    if (!dto) {
      throw new Error('Not authenticated')
    }
    const body: Record<string, string | undefined> = {
      volumeId,
      modelType,
    }
    const notify = options?.notificationEmail?.trim()
    if (notify) {
      body.notificationEmail = notify
    }
    const volName = options?.volumeDisplayName?.trim()
    if (volName) {
      body.volumeDisplayName = volName
    }
    const res = await fetch(`${this.apiBase}/api/jobs`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`POST /api/jobs failed: ${res.status}`)
    }
    const data = (await res.json()) as JobResponseDto
    return mapJob(data)
  }

  async getJob(jobId: string): Promise<SegmentationJob | null> {
    const data = await this.getJsonHandle404<JobResponseDto>(`/api/jobs/${jobId}`)
    return data ? mapJob(data) : null
  }

  async listJobs(): Promise<SegmentationJob[]> {
    const list = await this.http.getJson<JobResponseDto[]>('/api/jobs')
    return list.map(mapJob)
  }
}

class HttpAnalyticsRepository implements AnalyticsRepository {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async getMyAnalytics(): Promise<AnalyticsSummary> {
    const dto = await this.http.getJson<AnalyticsResponseDto>(
      '/api/users/me/analytics',
    )
    return {
      userId: dto.userId,
      totalUploads: dto.totalUploads,
      totalJobs: dto.totalJobs,
      completedJobs: dto.completedJobs,
      failedJobs: dto.failedJobs,
      runningOrQueuedJobs: dto.runningOrQueuedJobs,
      jobsByModel: dto.jobsByModel,
      recentJobs: dto.recentJobs.map(mapJob),
    }
  }
}

/** Backend sends completion email on successful jobs when configured; client does not POST /notify by default. */
class HttpNotificationRepository implements NotificationRepository {
  async notifySegmentationComplete(_payload: {
    userEmail: string
    job: SegmentationJob
  }): Promise<void> {
    void _payload
  }
}

export function createHttpRepositories(baseUrl: string): RepositoryBundle {
  const base = baseUrl.replace(/\/$/, '')
  const http = createHttpClient(base)
  return {
    auth: new HttpAuthRepository(http),
    volumes: new HttpVolumeRepository(http),
    jobs: new HttpJobRepository(http, base),
    analytics: new HttpAnalyticsRepository(http),
    notifications: new HttpNotificationRepository(),
  }
}
