'use client'

import { AppLayout } from '@presentation/components/AppLayout'
import { useAuth } from '@presentation/context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

export default function AppSegmentLayout({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`)
    }
  }, [loading, session, pathname, router])

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-muted"
        role="status"
      >
        Loading session…
      </div>
    )
  }

  if (!session) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-muted"
        role="status"
      >
        Redirecting to sign in…
      </div>
    )
  }

  return <AppLayout>{children}</AppLayout>
}
