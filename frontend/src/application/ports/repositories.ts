import type { Session } from '@domain/entities/session'
import type {
  AnalyticsSummary,
  SegmentationJob,
  VolumeFormat,
  VolumeMetadata,
} from '@domain/entities/segmentation'
import type { User } from '@domain/entities/user'

export type UserProfileUpdate = Partial<
  Pick<User, 'displayName' | 'organization'>
>

export interface AuthRepository {
  login(email: string, password: string): Promise<Session>
  logout(): Promise<void>
  getCurrentSession(): Promise<Session | null>
  updateProfile(updates: UserProfileUpdate): Promise<Session>
}

export interface VolumeRepository {
  upload(files: File[], format: VolumeFormat): Promise<VolumeMetadata>
}

export type CreateJobOptions = {
  volumeDisplayName?: string
  notificationEmail?: string
}

export interface JobRepository {
  createJob(
    volumeId: string,
    modelType: string,
    options?: CreateJobOptions,
  ): Promise<SegmentationJob>
  getJob(jobId: string): Promise<SegmentationJob | null>
  listJobs(): Promise<SegmentationJob[]>
}

export interface AnalyticsRepository {
  getMyAnalytics(): Promise<AnalyticsSummary>
}

export interface NotificationRepository {
  notifySegmentationComplete(payload: {
    userEmail: string
    job: SegmentationJob
  }): Promise<void>
}

export type RepositoryBundle = {
  auth: AuthRepository
  volumes: VolumeRepository
  jobs: JobRepository
  analytics: AnalyticsRepository
  notifications: NotificationRepository
}
