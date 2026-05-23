import type { User } from '@domain/entities/user'

/**
 * Generates initials for a user's avatar.
 * Uses the display name if available, otherwise falls back to email.
 */
export function userDisplayInitials(user: User): string {
  const name = user.displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
  }
  const emailPart = user.email.split('@')[0] || ''
  return emailPart.slice(0, 2).toUpperCase() || 'U'
}
