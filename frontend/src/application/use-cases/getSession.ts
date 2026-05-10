import type { AuthRepository } from '@application/ports/repositories'
import type { Session } from '@domain/entities/session'

export async function getSession(
  auth: AuthRepository,
): Promise<Session | null> {
  return auth.getCurrentSession()
}
