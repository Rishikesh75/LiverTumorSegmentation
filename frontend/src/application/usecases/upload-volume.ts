import type { Volume, VolumeFormat } from '@domain/models/volume'
import type { VolumeRepository } from '@domain/repositories/volume-repository'

export function createUploadVolumeUseCase(volumeRepository: VolumeRepository) {
  return (file: File, format: VolumeFormat): Promise<Volume> =>
    volumeRepository.uploadLocalFile(file, format)
}
