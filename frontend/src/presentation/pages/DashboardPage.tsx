import { getAnalytics } from '@application/use-cases/getAnalytics'
import { AnalyticsPanel } from '@presentation/components/AnalyticsPanel'
import { useAppServices } from '@presentation/context/AppServicesContext'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { repos } = useAppServices()

  const { data, isPending, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => getAnalytics(repos.analytics),
  })

  if (isPending) {
    return (
      <div className="app-loading" role="status">
        Loading dashboard…
      </div>
    )
  }

  if (error || !data) {
    return (
      <p className="form-error">
        {error instanceof Error ? error.message : 'Failed to load analytics'}
      </p>
    )
  }

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">
          Overview of your uploads and segmentation jobs (mock API).
        </p>
        <Link to="/upload" className="btn btn-primary">
          Upload volume
        </Link>
      </header>
      <AnalyticsPanel summary={data} />
    </div>
  )
}
