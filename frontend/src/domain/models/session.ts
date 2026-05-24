import type { User } from '@domain/models/user'

export interface Session {
  user: User
  token: string
}
