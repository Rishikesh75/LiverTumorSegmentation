'use client'

import { getAnalytics } from '@application/use-cases/getAnalytics'
import { AnalyticsPanel } from '@presentation/components/AnalyticsPanel'
import { useAppServices } from '@presentation/context/AppServicesContext'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export default function DashboardPage() {
  const { repos } = useAppServices()

  const { data, isPending, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => getAnalytics(repos.analytics),
  })

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted" role="status">
        Loading dashboard…
      </div>
    )
  }

  if (error || !data) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : 'Failed to load analytics'}
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of your uploads and segmentation jobs.
        </p>
        <Link
          href="/upload"
          className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          Upload volume
        </Link>
      </header>
      <AnalyticsPanel summary={data} />
    </div>
  )
}
