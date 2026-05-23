'use client'

import type { SegmentationJob } from '@domain/entities/segmentation'
import { useEffect, useRef } from 'react'

export type JobCompleteModalProps = {
  open: boolean
  onClose: () => void
  job: SegmentationJob
  userEmail: string
  notifyError: string | null
  notifyPending: boolean
}

export function JobCompleteModal({
  open,
  onClose,
  job,
  userEmail,
  notifyError,
  notifyPending,
}: JobCompleteModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
    }
    if (!open && el.open) {
      el.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-slate-950/75"
      aria-labelledby="job-complete-title"
      onClose={onClose}
    >
      <div className="p-6">
        <h2 id="job-complete-title" className="mb-3 text-lg font-semibold text-white">
          Segmentation complete
        </h2>
        <p className="mb-2 text-sm text-slate-300">
          Your job for <strong className="text-white">{job.volumeName}</strong>{' '}
          finished successfully using model{' '}
          <code className="rounded bg-violet-900/30 px-1 text-violet-200">
            {job.modelType}
          </code>
          .
        </p>
        <p className="mb-2 text-sm text-slate-300">
          A summary of your results was sent to{' '}
          <strong className="text-white">{userEmail}</strong>
          {notifyPending ? ' (sending…)' : '.'}
        </p>
        <p className="mb-4 text-xs text-muted">
          In production this is sent by the server. The mock logs the message
          and stores it in localStorage for demo purposes.
        </p>
        {notifyError ? (
          <p className="mb-3 text-sm text-danger">{notifyError}</p>
        ) : null}
        <button
          type="button"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          onClick={onClose}
        >
          View results
        </button>
      </div>
    </dialog>
  )
}
