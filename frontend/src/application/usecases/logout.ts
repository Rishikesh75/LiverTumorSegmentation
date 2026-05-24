import type { AuthRepository } from '@domain/repositories/auth-repository'

export function createLogoutUseCase(authRepository: AuthRepository) {
  return (): Promise<void> => authRepository.logout()
}
