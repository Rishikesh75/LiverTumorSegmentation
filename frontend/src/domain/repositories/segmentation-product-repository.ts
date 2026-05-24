import type { SegmentationProduct } from '@domain/models/segmentation-product'

export interface SegmentationProductRepository {
  list(): Promise<SegmentationProduct[]>
  getById(id: string): Promise<SegmentationProduct | null>
}
