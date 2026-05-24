import type { Session } from '@domain/models/session'

export interface AuthRepository {
  login(email: string, password: string): Promise<Session>
  getCurrentUser(): Promise<Session | null>
  logout(): Promise<void>
}
