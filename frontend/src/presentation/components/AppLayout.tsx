'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserProfileMenu } from '@presentation/components/UserProfileMenu'

function navClass(active: boolean) {
  return active
    ? 'rounded-lg bg-violet-600/20 px-3 py-2 text-sm font-medium text-violet-300'
    : 'rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white'
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-border bg-surface px-5 py-3 shadow-sm">
        <nav className="flex flex-1 items-center gap-1" aria-label="Main">
          <Link href="/" className={navClass(pathname === '/')}>
            Dashboard
          </Link>
          <Link href="/upload" className={navClass(pathname === '/upload')}>
            Upload volume
          </Link>
        </nav>
        <div className="flex items-center">
          <UserProfileMenu />
        </div>
      </header>
      <main className="flex-1 px-5 py-8">{children}</main>
    </div>
  )
}
