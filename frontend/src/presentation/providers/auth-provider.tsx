'use client'

import { AuthError } from '@domain/models/auth-error'
import type { User } from '@domain/models/user'
import {
  getCurrentUserUseCase,
  loginUseCase,
  logoutUseCase,
} from '@lib/composition'
import { queryKeys } from '@/src/constants/query-keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUserUseCase,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase(email, password),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.me, session)
      setError(null)
    },
    onError: (err: unknown) => {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Unable to sign in. Please try again.')
      }
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutUseCase,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me, null)
      setError(null)
    },
  })

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password })
    },
    [loginMutation],
  )

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: sessionQuery.data?.user ?? null,
      isLoading: sessionQuery.isLoading,
      isAuthenticated: Boolean(sessionQuery.data?.user),
      error,
      login,
      logout,
      clearError,
    }),
    [
      sessionQuery.data?.user,
      sessionQuery.isLoading,
      error,
      login,
      logout,
      clearError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
