'use client'

import type { VolumeFormat } from '@domain/models/volume'
import { Alert } from '@presentation/ui/alert'
import { Button } from '@presentation/ui/button'
import { Label } from '@presentation/ui/label'
import { useRef, useState, type DragEvent } from 'react'

const ACCEPT_BY_FORMAT: Record<VolumeFormat, string> = {
  nifti: '.nii,.nii.gz',
  dicom: '.dcm',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface LocalFileUploadProps {
  format: VolumeFormat
  onFormatChange: (format: VolumeFormat) => void
  selectedFile: File | null
  onFileSelect: (file: File | null) => void
  onUpload: () => void
  isUploading: boolean
  canUpload?: boolean
  error?: string | null
}

export function LocalFileUpload({
  format,
  onFormatChange,
  selectedFile,
  onFileSelect,
  onUpload,
  isUploading,
  canUpload = true,
  error,
}: LocalFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(file: File | undefined) {
    if (!file) return
    onFileSelect(file)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  return (
    <div className="space-y-4">
      {error && <Alert>{error}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="format">Volume format</Label>
        <select
          id="format"
          value={format}
          onChange={(event) => onFormatChange(event.target.value as VolumeFormat)}
          disabled={isUploading}
          className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="nifti">NIfTI (.nii, .nii.gz)</option>
          <option value="dicom">DICOM (.dcm)</option>
        </select>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
        }`}
      >
        <p className="text-sm font-medium">Drag and drop your file here</p>
        <p className="mt-1 text-xs text-muted-foreground">or browse from your computer</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_BY_FORMAT[format]}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>

      {selectedFile && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          <p className="font-medium">{selectedFile.name}</p>
          <p className="text-muted-foreground">{formatBytes(selectedFile.size)}</p>
        </div>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={!selectedFile || isUploading || !canUpload}
        isLoading={isUploading}
        onClick={onUpload}
      >
        Upload volume
      </Button>
    </div>
  )
}
