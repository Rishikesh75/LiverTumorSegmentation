import type { AnalyticsSummary } from '@domain/entities/segmentation'
import { JobStatusBadge } from '@presentation/components/JobStatusBadge'
import { Link } from 'react-router-dom'

type Props = {
  summary: AnalyticsSummary
}

export function AnalyticsPanel({ summary }: Props) {
  return (
    <section className="card analytics-panel" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading">Your analytics</h2>
      <div className="analytics-grid">
        <div className="stat">
          <span className="stat-value">{summary.totalUploads}</span>
          <span className="stat-label">Uploads</span>
        </div>
        <div className="stat">
          <span className="stat-value">{summary.totalJobs}</span>
          <span className="stat-label">Jobs</span>
        </div>
        <div className="stat">
          <span className="stat-value">{summary.completedJobs}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat">
          <span className="stat-value">{summary.failedJobs}</span>
          <span className="stat-label">Failed</span>
        </div>
        <div className="stat">
          <span className="stat-value">{summary.runningOrQueuedJobs}</span>
          <span className="stat-label">Running / queued</span>
        </div>
      </div>

      {Object.keys(summary.jobsByModel).length > 0 ? (
        <div className="analytics-models">
          <h3>Jobs by model</h3>
          <ul className="model-list">
            {Object.entries(summary.jobsByModel).map(([model, count]) => (
              <li key={model}>
                <code>{model}</code> <span>× {count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="analytics-recent">
        <h3>Recent jobs</h3>
        {summary.recentJobs.length === 0 ? (
          <p className="muted">No jobs yet. Upload a volume to get started.</p>
        ) : (
          <ul className="job-list-mini">
            {summary.recentJobs.map((j) => (
              <li key={j.id}>
                <Link to={`/jobs/${j.id}`}>{j.volumeName}</Link>
                <JobStatusBadge status={j.status} />
                <span className="muted">{j.modelType}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
