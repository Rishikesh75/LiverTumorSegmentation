import type { NotificationRepository } from '@application/ports/repositories'
import type { SegmentationJob } from '@domain/entities/segmentation'

export async function notifyJobComplete(
  notifications: NotificationRepository,
  payload: { userEmail: string; job: SegmentationJob },
): Promise<void> {
  return notifications.notifySegmentationComplete(payload)
}
