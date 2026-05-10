import type { User } from '@domain/entities/user'

export type Session = {
  user: User
  token: string
}
