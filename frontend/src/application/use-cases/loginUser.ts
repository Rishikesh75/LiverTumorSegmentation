import type { AuthRepository } from '@application/ports/repositories'
import type { Session } from '@domain/entities/session'

export async function loginUser(
  auth: AuthRepository,
  email: string,
  password: string,
): Promise<Session> {
  return auth.login(email, password)
}
