import { notifyJobComplete } from '@application/use-cases/notifyJobComplete'
import { getJob } from '@application/use-cases/getJob'
import type { SegmentationJob } from '@domain/entities/segmentation'
import { JobCompleteModal } from '@presentation/components/JobCompleteModal'
import { JobStatusBadge } from '@presentation/components/JobStatusBadge'
import { useAuth } from '@presentation/context/AuthContext'
import { useAppServices } from '@presentation/context/AppServicesContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { startTransition, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const completionStorageKey = (jobId: string) =>
  `lts-job-complete-modal-${jobId}`

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { repos } = useAppServices()
  const { session } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [notifyError, setNotifyError] = useState<string | null>(null)

  const { data: job, isPending } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(repos.jobs, jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (q) => {
      const j = q.state.data
      if (!j) return 1000
      if (j.status === 'completed' || j.status === 'failed') return false
      return 1000
    },
  })

  const notifyMutation = useMutation({
    mutationFn: (payload: { userEmail: string; job: SegmentationJob }) => {
      return notifyJobComplete(repos.notifications, payload)
    },
    onError: (e) => {
      setNotifyError(e instanceof Error ? e.message : 'Notification failed')
    },
  })

  useEffect(() => {
    if (!jobId || !job || job.status !== 'completed' || !session) return
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(completionStorageKey(job.id))) return
    sessionStorage.setItem(completionStorageKey(job.id), '1')
    startTransition(() => {
      setModalOpen(true)
      setNotifyError(null)
    })
    notifyMutation.mutate({
      userEmail: session.user.email,
      job,
    })
  }, [job, job?.id, job?.status, jobId, session, notifyMutation])

  if (!jobId) {
    return <p className="form-error">Missing job id</p>
  }

  if (isPending && !job) {
    return (
      <div className="app-loading" role="status">
        Loading job…
      </div>
    )
  }

  if (!job) {
    return (
      <p className="form-error">
        Job not found. <Link to="/">Back to dashboard</Link>
      </p>
    )
  }

  const polling = job.status === 'queued' || job.status === 'running'

  return (
    <div className="page job-detail-page">
      {job.status === 'completed' && session ? (
        <JobCompleteModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          job={job}
          userEmail={session.user.email}
          notifyError={notifyError}
          notifyPending={notifyMutation.isPending}
        />
      ) : null}

      <nav className="breadcrumb">
        <Link to="/">Dashboard</Link>
        <span aria-hidden> / </span>
        <span>Job</span>
      </nav>
      <header className="page-header">
        <h1>{job.volumeName}</h1>
        <p className="job-meta">
          <JobStatusBadge status={job.status} />
          <span className="muted">Model: {job.modelType}</span>
          {polling ? (
            <span className="muted" role="status">
              Updating…
            </span>
          ) : null}
        </p>
      </header>

      {job.errorMessage ? (
        <p className="form-error">{job.errorMessage}</p>
      ) : null}

      {job.status === 'completed' && job.resultPreviewUrls?.length ? (
        <section
          id="job-results"
          className="card results-section"
          aria-label="Slice previews"
        >
          <h2>Slice previews (mock)</h2>
          <p className="muted">
            Production would serve masks and volumes from the API; here we show
            placeholder images after the mock job completes.
          </p>
          <div className="preview-grid">
            {job.resultPreviewUrls.map((url, i) => (
              <figure key={url} className="preview-figure">
                <img src={url} alt={`Segmentation preview ${i + 1}`} width={256} height={256} />
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
