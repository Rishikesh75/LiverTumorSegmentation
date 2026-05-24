import type { Volume, VolumeFormat } from '@domain/models/volume'

export interface VolumeRepository {
  uploadLocalFile(file: File, format: VolumeFormat): Promise<Volume>
}
