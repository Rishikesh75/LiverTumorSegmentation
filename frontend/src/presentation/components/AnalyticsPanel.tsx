import type { AnalyticsSummary } from '@domain/entities/segmentation'
import { JobStatusBadge } from '@presentation/components/JobStatusBadge'
import Link from 'next/link'

type Props = {
  summary: AnalyticsSummary
}

export function AnalyticsPanel({ summary }: Props) {
  return (
    <section
      className="rounded-xl border border-border bg-surface p-6 shadow-sm"
      aria-labelledby="analytics-heading"
    >
      <h2 id="analytics-heading" className="mb-4 text-lg font-semibold text-white">
        Your analytics
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ['Uploads', summary.totalUploads],
          ['Jobs', summary.totalJobs],
          ['Completed', summary.completedJobs],
          ['Failed', summary.failedJobs],
          ['Running / queued', summary.runningOrQueuedJobs],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-slate-900/40 p-4 text-center"
          >
            <div className="text-2xl font-semibold text-white">{value}</div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      {Object.keys(summary.jobsByModel).length > 0 ? (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-slate-300">Jobs by model</h3>
          <ul className="space-y-1 text-sm">
            {Object.entries(summary.jobsByModel).map(([model, count]) => (
              <li key={model} className="flex gap-2">
                <code className="rounded bg-violet-900/30 px-1.5 py-0.5 text-violet-200">
                  {model}
                </code>
                <span className="text-muted">× {count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-medium text-slate-300">Recent jobs</h3>
        {summary.recentJobs.length === 0 ? (
          <p className="text-sm text-muted">
            No jobs yet. Upload a volume to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {summary.recentJobs.map((j) => (
              <li
                key={j.id}
                className="flex flex-wrap items-center gap-3 py-3 text-sm"
              >
                <Link
                  href={`/jobs/${j.id}`}
                  className="font-medium text-violet-300 hover:text-violet-200"
                >
                  {j.volumeName}
                </Link>
                <JobStatusBadge status={j.status} />
                <span className="text-muted">{j.modelType}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
