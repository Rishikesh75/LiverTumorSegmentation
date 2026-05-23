import type { VolumeRepository } from '@application/ports/repositories'
import type { VolumeMetadata } from '@domain/entities/segmentation'
import { detectVolumeFormat } from '@domain/utils/volumeFormat'

export async function uploadVolume(
  volumes: VolumeRepository,
  files: File[],
): Promise<VolumeMetadata> {
  const format = detectVolumeFormat(files)
  return volumes.upload(files, format)
}
