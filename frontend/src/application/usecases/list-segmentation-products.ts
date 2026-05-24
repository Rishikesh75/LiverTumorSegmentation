import type { SegmentationProductRepository } from '@domain/repositories/segmentation-product-repository'
import type { SegmentationProduct } from '@domain/models/segmentation-product'

export function createListSegmentationProductsUseCase(
  repository: SegmentationProductRepository,
) {
  return (): Promise<SegmentationProduct[]> => repository.list()
}

export function createGetSegmentationProductUseCase(
  repository: SegmentationProductRepository,
) {
  return (id: string): Promise<SegmentationProduct | null> => repository.getById(id)
}
