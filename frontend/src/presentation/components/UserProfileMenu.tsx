import { userDisplayInitials } from '@domain/lib/userDisplayInitials'
import { ProfileEditForm } from '@presentation/components/ProfileEditForm'
import { useAuth } from '@presentation/context/AuthContext'
import { useEffect, useRef, useState } from 'react'

export function UserProfileMenu() {
  const { session, logout } = useAuth()
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

  return (
    <div className="user-profile-menu" ref={wrapRef}>
      <button
        type="button"
        className="user-profile-trigger"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={() => setMenuOpen((o) => !o)}
        title={label}
      >
        <span className="user-profile-avatar" aria-hidden>
          {initials}
        </span>
        <span className="user-profile-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {menuOpen ? (
        <div className="user-profile-dropdown" role="menu">
          <button
            type="button"
            className="user-profile-dropdown-item"
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
            className="user-profile-dropdown-item"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              void logout()
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}

      {profileOpen ? (
        <div
          className="app-modal-backdrop"
          role="presentation"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="app-dialog-panel app-dialog-panel--narrow"
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
