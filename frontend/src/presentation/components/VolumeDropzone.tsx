'use client'

import { isAcceptedVolumeFile } from '@domain/utils/volumeFormat'
import {
  useCallback,
  useId,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'

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
    <div>
      <label
        htmlFor={inputId}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
          dragOver
            ? 'border-violet-400 bg-violet-900/20'
            : 'border-border bg-surface hover:border-violet-500/50'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
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
          className="sr-only"
          accept={accept}
          multiple
          disabled={disabled}
          onChange={onInputChange}
        />
        <strong className="text-white">Drop volume here</strong>
        <p className="mt-2 text-center text-sm text-muted">
          NIfTI (.nii, .nii.gz) · DICOM (.dcm) · ZIP of DICOM
        </p>
        <span className="mt-4 rounded-lg border border-border bg-slate-800 px-4 py-2 text-sm text-slate-200">
          Browse files
        </span>
      </label>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  )
}
