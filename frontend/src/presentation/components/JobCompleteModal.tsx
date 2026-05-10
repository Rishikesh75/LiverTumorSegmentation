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
      className="app-dialog"
      aria-labelledby="job-complete-title"
      onClose={onClose}
    >
      <div className="app-dialog-panel">
        <h2 id="job-complete-title">Segmentation complete</h2>
        <p>
          Your job for <strong>{job.volumeName}</strong> finished successfully
          using model <code>{job.modelType}</code>.
        </p>
        <p>
          A summary of your results was sent to{' '}
          <strong>{userEmail}</strong>
          {notifyPending ? ' (sending…)' : '.'}
        </p>
        <p className="muted">
          In production this is sent by the server. The mock logs the message
          and stores it in localStorage for demo purposes.
        </p>
        {notifyError ? <p className="form-error">{notifyError}</p> : null}
        <div className="app-dialog-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            View results
          </button>
        </div>
      </div>
    </dialog>
  )
}
