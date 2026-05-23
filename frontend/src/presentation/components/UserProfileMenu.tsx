'use client'

import { userDisplayInitials } from '@domain/utils/userDisplayInitials'
import { ProfileEditForm } from '@presentation/components/ProfileEditForm'
import { useAuth } from '@presentation/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function UserProfileMenu() {
  const { session, logout } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  useEffect(() => {
    if (!profileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [profileOpen])

  if (!session) return null

  const initials = userDisplayInitials(session.user)
  const label = session.user.displayName?.trim() || session.user.email

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    router.replace('/login')
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="flex items-center gap-1 rounded-full border border-border bg-slate-800 px-2 py-1 text-sm hover:bg-slate-700"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={() => setMenuOpen((o) => !o)}
        title={label}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white"
          aria-hidden
        >
          {initials}
        </span>
        <span className="text-muted" aria-hidden>
          ▾
        </span>
      </button>
      {menuOpen ? (
        <div
          className="absolute right-0 z-50 mt-1 min-w-[10rem] rounded-lg border border-border bg-surface py-1 shadow-lg"
          role="menu"
        >
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              setProfileOpen(true)
            }}
          >
            Profile
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
            role="menuitem"
            onClick={() => void handleLogout()}
          >
            Sign out
          </button>
        </div>
      ) : null}

      {profileOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
          role="presentation"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl"
            role="dialog"
            aria-labelledby="profile-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileEditForm
              key={`${session.user.displayName ?? ''}|${session.user.organization ?? ''}`}
              session={session}
              onSaved={() => setProfileOpen(false)}
              onCancel={() => setProfileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
