'use client'

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

const inputClass =
  'rounded-lg border border-border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 disabled:opacity-60'

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
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h2 id="profile-dialog-title" className="text-lg font-semibold text-white">
        Profile
      </h2>
      <p className="text-sm text-muted">Update how your name appears in the app.</p>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-300">Email</span>
        <input
          type="email"
          className={inputClass}
          value={session.user.email}
          disabled
          readOnly
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-300">Display name</span>
        <input
          type="text"
          className={inputClass}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
          placeholder="Optional"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-300">Organization</span>
        <input
          type="text"
          className={inputClass}
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          autoComplete="organization"
          placeholder="Optional"
        />
      </label>
      {saveMut.error ? (
        <p className="text-sm text-danger">
          {saveMut.error instanceof Error ? saveMut.error.message : 'Save failed'}
        </p>
      ) : null}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          disabled={saveMut.isPending}
        >
          {saveMut.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
