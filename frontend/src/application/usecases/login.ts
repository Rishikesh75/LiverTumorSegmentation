import type { AuthRepository } from '@domain/repositories/auth-repository'
import type { Session } from '@domain/models/session'

export function createLoginUseCase(authRepository: AuthRepository) {
  return (email: string, password: string): Promise<Session> =>
    authRepository.login(email, password)
}
