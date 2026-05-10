import type { JobStatus } from '@domain/entities/segmentation'

const LABEL: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`job-badge job-badge--${status}`} data-status={status}>
      {LABEL[status]}
    </span>
  )
}
