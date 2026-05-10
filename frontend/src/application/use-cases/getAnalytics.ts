import type { AnalyticsRepository } from '@application/ports/repositories'
import type { AnalyticsSummary } from '@domain/entities/segmentation'

export async function getAnalytics(
  analytics: AnalyticsRepository,
): Promise<AnalyticsSummary> {
  return analytics.getMyAnalytics()
}
