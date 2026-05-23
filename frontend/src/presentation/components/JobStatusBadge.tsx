import type { JobStatus } from '@domain/entities/segmentation'

const LABEL: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
}

const STYLES: Record<JobStatus, string> = {
  queued: 'bg-slate-700 text-slate-200',
  running: 'bg-amber-900/50 text-amber-200',
  completed: 'bg-emerald-900/50 text-emerald-200',
  failed: 'bg-red-900/50 text-red-200',
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
      data-status={status}
    >
      {LABEL[status]}
    </span>
  )
}
