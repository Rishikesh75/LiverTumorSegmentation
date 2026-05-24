import type { AuthRepository } from '@domain/repositories/auth-repository'
import type { Session } from '@domain/models/session'

export function createGetCurrentUserUseCase(authRepository: AuthRepository) {
  return (): Promise<Session | null> => authRepository.getCurrentUser()
}
