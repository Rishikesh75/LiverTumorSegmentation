'use client'

import { ROUTES } from '@/src/constants/routes'
import { useAuth } from '@presentation/hooks/use-auth'
import { Button } from '@presentation/ui/button'
import { Spinner } from '@presentation/ui/spinner'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface AppShellLayoutProps {
  children: ReactNode
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.login)
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div>
            <p className="text-lg font-semibold text-foreground">LiverSeg Pro</p>
            <p className="text-xs text-muted-foreground">Medical segmentation platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => logout().then(() => router.push(ROUTES.login))}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
