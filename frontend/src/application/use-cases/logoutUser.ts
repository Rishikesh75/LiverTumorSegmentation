import type { AuthRepository } from '@application/ports/repositories'

export async function logoutUser(auth: AuthRepository): Promise<void> {
  return auth.logout()
}
