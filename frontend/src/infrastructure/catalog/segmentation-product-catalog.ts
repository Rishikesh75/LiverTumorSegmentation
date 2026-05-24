import type { SegmentationProduct } from '@domain/models/segmentation-product'

export const SEGMENTATION_PRODUCT_CATALOG: SegmentationProduct[] = [
  {
    id: 'liver-tumor',
    name: 'Liver Tumor',
    description: '3D liver tumor segmentation for CT and MRI volumes.',
    status: 'available',
    iconKey: 'liver',
    supportedFormats: ['NIfTI', 'DICOM'],
  },
  {
    id: 'brain-tumor',
    name: 'Brain Tumor',
    description: 'MRI brain tumor segmentation and volumetric analysis.',
    status: 'coming_soon',
    iconKey: 'brain',
    supportedFormats: ['NIfTI', 'DICOM'],
  },
  {
    id: 'lung-nodule',
    name: 'Lung Nodule',
    description: 'Chest CT nodule detection and segmentation.',
    status: 'coming_soon',
    iconKey: 'lung',
    supportedFormats: ['NIfTI', 'DICOM'],
  },
  {
    id: 'kidney-lesion',
    name: 'Kidney Lesion',
    description: 'Renal lesion segmentation for contrast-enhanced CT.',
    status: 'coming_soon',
    iconKey: 'kidney',
    supportedFormats: ['NIfTI', 'DICOM'],
  },
]
