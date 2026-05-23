'use client'

import { useAuth } from '@presentation/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState, Suspense } from 'react'

function GoogleMark() {
  return (
    <svg
      className="shrink-0"
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
    process.env.NEXT_PUBLIC_OAUTH_GOOGLE_PATH ?? '/oauth2/authorization/google'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')
  return `${base}${normalizedPath}`
}

const inputClass =
  'rounded-lg border border-border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-500'

function LoginForm() {
  const { session, loading, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawFrom = searchParams.get('from')
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

  const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'

  useEffect(() => {
    if (!loading && session) {
      router.replace(from)
    }
  }, [loading, session, from, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted" role="status">
        Loading…
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted" role="status">
        Redirecting…
      </div>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(email, password)
      router.replace(from)
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-lg">
        <h1 className="mb-6 text-center text-xl font-semibold text-white">Sign in</h1>
        <div className="mb-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
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
        <div className="relative my-6 text-center text-xs text-muted">
          <span className="relative z-10 bg-surface px-2">or continue with email</span>
          <div className="absolute inset-x-0 top-1/2 border-t border-border" aria-hidden />
        </div>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              className={inputClass}
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              className={inputClass}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            disabled={pending}
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted" role="status">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
