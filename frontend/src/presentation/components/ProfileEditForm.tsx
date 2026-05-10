import { updateUserProfile } from '@application/use-cases/updateUserProfile'
import type { Session } from '@domain/entities/session'
import { useAuth } from '@presentation/context/AuthContext'
import { useAppServices } from '@presentation/context/AppServicesContext'
import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'

type Props = {
  session: Session
  onSaved: () => void
  onCancel: () => void
}

export function ProfileEditForm({ session, onSaved, onCancel }: Props) {
  const { refresh } = useAuth()
  const { repos } = useAppServices()
  const [displayName, setDisplayName] = useState(
    () => session.user.displayName ?? '',
  )
  const [organization, setOrganization] = useState(
    () => session.user.organization ?? '',
  )

  const saveMut = useMutation({
    mutationFn: () =>
      updateUserProfile(repos.auth, {
        displayName: displayName.trim() || undefined,
        organization: organization.trim() || undefined,
      }),
    onSuccess: async () => {
      await refresh()
      onSaved()
    },
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    saveMut.mutate()
  }

  return (
    <form className="stack-form profile-form" onSubmit={onSubmit}>
      <h2 id="profile-dialog-title">Profile</h2>
      <p className="muted">Update how your name appears in the app.</p>
      <label className="field">
        <span>Email</span>
        <input type="email" value={session.user.email} disabled readOnly />
      </label>
      <label className="field">
        <span>Display name</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
          placeholder="Optional"
        />
      </label>
      <label className="field">
        <span>Organization</span>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          autoComplete="organization"
          placeholder="Optional"
        />
      </label>
      {saveMut.error ? (
        <p className="form-error">
          {saveMut.error instanceof Error ? saveMut.error.message : 'Save failed'}
        </p>
      ) : null}
      <div className="app-dialog-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saveMut.isPending}
        >
          {saveMut.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
