import type { AuthRepository, UserProfileUpdate } from '@application/ports/repositories'
import type { Session } from '@domain/entities/session'

export async function updateUserProfile(
  auth: AuthRepository,
  updates: UserProfileUpdate,
): Promise<Session> {
  return auth.updateProfile(updates)
}
