export type ProductStatus = 'available' | 'coming_soon'

export interface SegmentationProduct {
  id: string
  name: string
  description: string
  status: ProductStatus
  iconKey: string
  supportedFormats: string[]
}
