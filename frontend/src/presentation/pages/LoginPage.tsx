import { useAuth } from '@presentation/context/AuthContext'
import { type FormEvent, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function GoogleMark() {
  return (
    <svg
      className="btn-google-mark"
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.42 32.583 29.238 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function googleOAuthStartUrl(): string {
  const path =
    import.meta.env.VITE_OAUTH_GOOGLE_PATH ?? '/oauth2/authorization/google'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = (
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
  ).replace(/\/$/, '')
  return `${base}${normalizedPath}`
}

export function LoginPage() {
  const { session, loading, login } = useAuth()
  const location = useLocation()
  const state = location.state as { from?: string } | null
  const rawFrom = state?.from
  const from =
    typeof rawFrom === 'string' &&
    rawFrom.startsWith('/') &&
    rawFrom !== '/login'
      ? rawFrom
      : '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

  if (loading) {
    return (
      <div className="app-loading" role="status">
        Loading…
      </div>
    )
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setPending(false)
    }
  }

  const startGoogleOAuth = () => {
    window.location.assign(googleOAuthStartUrl())
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Sign in</h1>
        <div className="auth-oauth">
          <button
            type="button"
            className="btn btn-google"
            onClick={startGoogleOAuth}
            disabled={useMockApi}
            title={
              useMockApi
                ? 'Google sign-in uses the Spring OAuth backend'
                : undefined
            }
          >
          <GoogleMark />
            Sign in with Google
          </button>
        </div>
        <div className="auth-divider" role="separator">
          <span>or continue with email</span>
        </div>
        <form className="stack-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
