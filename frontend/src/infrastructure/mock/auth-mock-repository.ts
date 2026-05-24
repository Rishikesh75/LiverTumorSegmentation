const MOCK_SESSION_KEY = 'liver-tumor-segmentation-mock-session-v1'

import { AuthError } from '@domain/models/auth-error'
import type { Session } from '@domain/models/session'
import type { AuthRepository } from '@domain/repositories/auth-repository'

function readSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(MOCK_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function writeSession(session: Session | null): void {
  if (typeof window === 'undefined') return
  if (session) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY)
  }
}

export function createAuthMockRepository(): AuthRepository {
  return {
    async login(email: string, password: string): Promise<Session> {
      if (!email.trim() || !password.trim()) {
        throw new AuthError('Email and password are required.')
      }

      if (password !== 'demo') {
        throw new AuthError('Invalid email or password. Use password "demo" in mock mode.')
      }

      const session: Session = {
        user: {
          id: 'mock-user-1',
          email: email.trim(),
          displayName: email.split('@')[0] || 'Demo User',
          organization: 'Demo Hospital',
        },
        token: 'mock-token',
      }

      writeSession(session)
      return session
    },

    async getCurrentUser(): Promise<Session | null> {
      return readSession()
    },

    async logout(): Promise<void> {
      writeSession(null)
    },
  }
}
