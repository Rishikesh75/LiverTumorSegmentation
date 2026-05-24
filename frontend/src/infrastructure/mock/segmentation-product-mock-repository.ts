import { SEGMENTATION_PRODUCT_CATALOG } from '@infrastructure/catalog/segmentation-product-catalog'
import type { SegmentationProductRepository } from '@domain/repositories/segmentation-product-repository'

export function createSegmentationProductMockRepository(): SegmentationProductRepository {
  return {
    async list() {
      return [...SEGMENTATION_PRODUCT_CATALOG]
    },

    async getById(id: string) {
      return SEGMENTATION_PRODUCT_CATALOG.find((product) => product.id === id) ?? null
    },
  }
}
