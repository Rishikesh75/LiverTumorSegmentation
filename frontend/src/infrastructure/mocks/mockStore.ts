import type { Session } from '@domain/entities/session'
import type { SegmentationJob, VolumeMetadata } from '@domain/entities/segmentation'
import type { User } from '@domain/entities/user'

const STORAGE_KEY = 'liver-tumor-segmentation-mock-v1'
const NOTIFICATION_LOG_KEY = 'liver-tumor-segmentation-mock-notifications-v1'
const NOTIFICATION_LOG_MAX = 50

export type UserBucket = {
  volumes: VolumeMetadata[]
  jobs: SegmentationJob[]
}

export type UserProfileStored = Partial<Pick<User, 'displayName' | 'organization'>>

export type PersistedMockState = {
  session: Session | null
  byUserId: Record<string, UserBucket>
  profilesByUserId: Record<string, UserProfileStored>
}

function emptyBucket(): UserBucket {
  return { volumes: [], jobs: [] }
}

export function applyStoredProfile(
  user: User,
  profile: UserProfileStored | undefined,
): User {
  if (!profile) return user
  return {
    ...user,
    ...(profile.displayName !== undefined
      ? { displayName: profile.displayName }
      : {}),
    ...(profile.organization !== undefined
      ? { organization: profile.organization }
      : {}),
  }
}

function normalizeState(raw: unknown): PersistedMockState {
  const o = raw as Partial<PersistedMockState> | null
  if (!o || typeof o !== 'object') {
    return { session: null, byUserId: {}, profilesByUserId: {} }
  }
  return {
    session: o.session ?? null,
    byUserId: o.byUserId ?? {},
    profilesByUserId: o.profilesByUserId ?? {},
  }
}

export function mergeSessionUserWithProfile(state: PersistedMockState): void {
  if (!state.session) return
  const profile = state.profilesByUserId[state.session.user.id]
  state.session = {
    ...state.session,
    user: applyStoredProfile(state.session.user, profile),
  }
}

export function loadMockState(): PersistedMockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { session: null, byUserId: {}, profilesByUserId: {} }
    }
    const state = normalizeState(JSON.parse(raw))
    mergeSessionUserWithProfile(state)
    return state
  } catch {
    return { session: null, byUserId: {}, profilesByUserId: {} }
  }
}

export function saveMockState(state: PersistedMockState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function ensureUserBucket(
  state: PersistedMockState,
  userId: string,
): UserBucket {
  if (!state.byUserId[userId]) {
    state.byUserId[userId] = emptyBucket()
  }
  return state.byUserId[userId]
}

export function userFromEmail(email: string): User {
  const normalized = email.trim().toLowerCase()
  const id =
    'u-' +
    (normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
      'anonymous')
  return { id, email: normalized }
}

export function randomToken(): string {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function mockSlicePreview(label: string, fill: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect fill="${fill}" width="256" height="256" rx="8"/><text x="128" y="132" text-anchor="middle" fill="white" font-size="14" font-family="system-ui,sans-serif">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function advanceJobStatus(job: SegmentationJob, nowMs: number): SegmentationJob {
  if (job.status === 'queued') {
    return { ...job, status: 'running', updatedAt: nowIso() }
  }
  if (job.status === 'running') {
    const last = new Date(job.updatedAt).getTime()
    if (nowMs - last > 2000) {
      return {
        ...job,
        status: 'completed',
        updatedAt: nowIso(),
        resultPreviewUrls: [
          mockSlicePreview('Original slice', '#334155'),
          mockSlicePreview('Segmentation', '#7c3aed'),
        ],
      }
    }
  }
  return job
}

export function syncJobArrays(bucket: UserBucket, nowMs: number): void {
  bucket.jobs = bucket.jobs.map((j) => advanceJobStatus(j, nowMs))
}

export type NotificationLogEntry = {
  at: string
  userEmail: string
  jobId: string
  volumeName: string
  modelType: string
}

export function appendNotificationLog(entry: NotificationLogEntry): void {
  try {
    const raw = localStorage.getItem(NOTIFICATION_LOG_KEY)
    const list: NotificationLogEntry[] = raw ? JSON.parse(raw) : []
    list.unshift(entry)
    localStorage.setItem(
      NOTIFICATION_LOG_KEY,
      JSON.stringify(list.slice(0, NOTIFICATION_LOG_MAX)),
    )
  } catch {
    /* ignore */
  }
}
