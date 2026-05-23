import { isAcceptedVolumeFile } from '@domain/utils/volumeFormat'
import { useCallback, useId, useState, type ChangeEvent, type DragEvent } from 'react'

type Props = {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export function VolumeDropzone({ onFilesSelected, disabled }: Props) {
  const inputId = useId()
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const accept = '.nii,.nii.gz,.gz,.dcm,.dic,.zip'

  const emit = useCallback(
    (list: File[]) => {
      const filtered = list.filter(isAcceptedVolumeFile)
      if (filtered.length === 0) {
        setError('No supported files in selection.')
        return
      }
      setError(null)
      onFilesSelected(filtered)
    },
    [onFilesSelected],
  )

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f?.length) emit(Array.from(f))
    e.target.value = ''
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const dt = e.dataTransfer
    if (dt.files?.length) {
      emit(Array.from(dt.files))
      return
    }
    const items = dt.items
    const acc: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const f = item.getAsFile()
        if (f) acc.push(f)
      }
    }
    if (acc.length) emit(acc)
  }

  return (
    <div className="dropzone-wrap">
      <label
        htmlFor={inputId}
        className={`dropzone ${dragOver ? 'dropzone--active' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input
          id={inputId}
          type="file"
          className="dropzone-input"
          accept={accept}
          multiple
          disabled={disabled}
          onChange={onInputChange}
        />
        <div className="dropzone-body">
          <strong>Drop volume here</strong>
          <p className="dropzone-hint">
            NIfTI (.nii, .nii.gz) · DICOM (.dcm) · ZIP of DICOM
          </p>
          <span className="btn btn-secondary">Browse files</span>
        </div>
      </label>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  )
}
