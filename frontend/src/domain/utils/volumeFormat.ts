import type { VolumeFormat } from '@domain/entities/segmentation'

/**
 * Checks if a file is an accepted volume file format based on its extension.
 */
export function isAcceptedVolumeFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.nii') ||
    name.endsWith('.nii.gz') ||
    name.endsWith('.gz') ||
    name.endsWith('.dcm') ||
    name.endsWith('.dic') ||
    name.endsWith('.zip')
  )
}

/**
 * Detects the overall VolumeFormat from a list of files.
 * Throws an error if the selection is invalid or inconsistent.
 */
export function detectVolumeFormat(files: File[]): VolumeFormat {
  if (files.length === 0) {
    throw new Error('No files selected.')
  }

  const hasNifti = files.some((f) => {
    const name = f.name.toLowerCase()
    return name.endsWith('.nii') || name.endsWith('.nii.gz') || name.endsWith('.gz')
  })

  const hasDicom = files.some((f) => {
    const name = f.name.toLowerCase()
    return name.endsWith('.dcm') || name.endsWith('.dic')
  })

  const hasZip = files.some((f) => f.name.toLowerCase().endsWith('.zip'))

  // Check for invalid combinations
  if (hasNifti) {
    if (files.length > 1) {
      throw new Error('NIfTI volume must be uploaded as a single file.')
    }
    if (hasDicom || hasZip) {
      throw new Error('Cannot mix NIfTI and other file types.')
    }
    return 'nifti'
  }

  if (hasZip) {
    if (files.length > 1) {
      throw new Error('ZIP archive must be uploaded individually.')
    }
    return 'dicom'
  }

  if (hasDicom) {
    // Ensure all files are DICOM
    const allDicom = files.every((f) => {
      const name = f.name.toLowerCase()
      return name.endsWith('.dcm') || name.endsWith('.dic')
    })
    if (!allDicom) {
      throw new Error('All files in a DICOM selection must be valid DICOM (.dcm or .dic) files.')
    }
    return 'dicom'
  }

  throw new Error('Unsupported volume format selection.')
}
