const MOCK_VOLUMES_KEY = 'liver-tumor-segmentation-mock-volumes-v1'

import type { Volume, VolumeFormat } from '@domain/models/volume'
import type { VolumeRepository } from '@domain/repositories/volume-repository'

function readVolumes(): Volume[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(MOCK_VOLUMES_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Volume[]
  } catch {
    return []
  }
}

function writeVolumes(volumes: Volume[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MOCK_VOLUMES_KEY, JSON.stringify(volumes))
}

export function createVolumeMockRepository(): VolumeRepository {
  return {
    async uploadLocalFile(file: File, format: VolumeFormat): Promise<Volume> {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const volume: Volume = {
        id: `mock-volume-${Date.now()}`,
        userId: 'mock-user-1',
        displayName: file.name,
        format,
        sizeBytes: file.size,
        fileCount: 1,
        createdAt: new Date().toISOString(),
      }

      const volumes = readVolumes()
      volumes.unshift(volume)
      writeVolumes(volumes)

      return volume
    },
  }
}
