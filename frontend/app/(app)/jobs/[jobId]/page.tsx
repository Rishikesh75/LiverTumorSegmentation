'use client'

import { getJob } from '@application/use-cases/getJob'
import { notifyJobComplete } from '@application/use-cases/notifyJobComplete'
import type { SegmentationJob } from '@domain/entities/segmentation'
import { JobCompleteModal } from '@presentation/components/JobCompleteModal'
import { JobStatusBadge } from '@presentation/components/JobStatusBadge'
import { useAuth } from '@presentation/context/AuthContext'
import { useAppServices } from '@presentation/context/AppServicesContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'

const completionStorageKey = (jobId: string) =>
  `lts-job-complete-modal-${jobId}`

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = params.jobId
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
    return <p className="text-sm text-danger">Missing job id</p>
  }

  if (isPending && !job) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted" role="status">
        Loading job…
      </div>
    )
  }

  if (!job) {
    return (
      <p className="text-sm text-danger">
        Job not found.{' '}
        <Link href="/" className="text-violet-300 hover:text-violet-200">
          Back to dashboard
        </Link>
      </p>
    )
  }

  const polling = job.status === 'queued' || job.status === 'running'

  return (
    <div className="mx-auto max-w-4xl">
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

      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="text-violet-300 hover:text-violet-200">
          Dashboard
        </Link>
        <span aria-hidden> / </span>
        <span>Job</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{job.volumeName}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <JobStatusBadge status={job.status} />
          <span className="text-muted">Model: {job.modelType}</span>
          {polling ? (
            <span className="text-muted" role="status">
              Updating…
            </span>
          ) : null}
        </p>
      </header>

      {job.errorMessage ? (
        <p className="mb-4 text-sm text-danger">{job.errorMessage}</p>
      ) : null}

      {job.status === 'completed' && job.resultPreviewUrls?.length ? (
        <section
          id="job-results"
          className="rounded-xl border border-border bg-surface p-6"
          aria-label="Slice previews"
        >
          <h2 className="mb-2 font-medium text-white">Slice previews</h2>
          <p className="mb-4 text-sm text-muted">
            Production would serve masks and volumes from the API; mock jobs show
            placeholder images after completion.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {job.resultPreviewUrls.map((url, i) => (
              <figure key={url} className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- external/mock preview URLs */}
                <img
                  src={url}
                  alt={`Segmentation preview ${i + 1}`}
                  width={256}
                  height={256}
                  className="h-auto w-full bg-black object-contain"
                />
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
