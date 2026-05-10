import { useAppServices } from '@presentation/context/AppServicesContext'
import { getSession } from '@application/use-cases/getSession'
import { loginUser } from '@application/use-cases/loginUser'
import { logoutUser } from '@application/use-cases/logoutUser'
import type { Session } from '@domain/entities/session'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type AuthContextValue = {
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { repos } = useAppServices()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const s = await getSession(repos.auth)
    setSession(s)
  }, [repos.auth])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const s = await getSession(repos.auth)
        if (!cancelled) setSession(s)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [repos.auth])

  const login = useCallback(
    async (email: string, password: string) => {
      const s = await loginUser(repos.auth, email, password)
      setSession(s)
    },
    [repos.auth],
  )

  const logout = useCallback(async () => {
    await logoutUser(repos.auth)
    setSession(null)
  }, [repos.auth])

  const value = useMemo(
    () => ({ session, loading, login, logout, refresh }),
    [session, loading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('AuthProvider is missing')
  }
  return ctx
}
