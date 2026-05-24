import { AuthError } from '@domain/models/auth-error'
import type { Session } from '@domain/models/session'
import type { User } from '@domain/models/user'
import type { AuthRepository } from '@domain/repositories/auth-repository'
import type { HttpClient } from '@infrastructure/http/http-client'

interface UserDto {
  id: string
  email: string
  displayName: string
  organization: string | null
}

interface SessionResponse {
  user: UserDto
  token: string
}

function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    displayName: dto.displayName,
    organization: dto.organization,
  }
}

function mapSession(response: SessionResponse): Session {
  return {
    user: mapUser(response.user),
    token: response.token,
  }
}

export function createAuthHttpRepository(httpClient: HttpClient): AuthRepository {
  return {
    async login(email: string, password: string): Promise<Session> {
      try {
        // const response = await httpClient.post<SessionResponse>('/api/auth/login', {
        //   email,
        //   password,
        // })
        const response: SessionResponse = {
        user: {
          id: 'sample-user-1',
          email: email,
          displayName: 'Demo User',
          organization: 'Demo Hospital',
        },
        token: 'cookie',
      }
        return mapSession(response)
      } catch {
        throw new AuthError('Invalid email or password.')
      }
    },

    async getCurrentUser(): Promise<Session | null> {
      const response = await httpClient.getOptional<SessionResponse>('/api/auth/me')
      if (!response) return null
      return mapSession(response)
    },

    async logout(): Promise<void> {
      await httpClient.post<void>('/api/auth/logout')
    },
  }
}
