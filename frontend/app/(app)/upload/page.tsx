'use client'

import { createSegmentationJob } from '@application/use-cases/createSegmentationJob'
import { uploadVolume } from '@application/use-cases/uploadVolume'
import {
  SEGMENTATION_MODELS,
  type SegmentationModelType,
} from '@domain/entities/segmentation'
import { detectVolumeFormat } from '@domain/utils/volumeFormat'
import { VolumeDropzone } from '@presentation/components/VolumeDropzone'
import { useAuth } from '@presentation/context/AuthContext'
import { useAppServices } from '@presentation/context/AppServicesContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

const NiftiPreview = dynamic(
  () =>
    import('@presentation/components/NiftiPreview').then((m) => m.NiftiPreview),
  {
    ssr: false,
    loading: () => (
      <p className="mt-6 text-sm text-muted" role="status">
        Loading NIfTI preview…
      </p>
    ),
  },
)

const inputClass =
  'rounded-lg border border-border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-500'

export default function UploadPage() {
  const { repos } = useAppServices()
  const { session } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<File[] | null>(null)
  const [formatError, setFormatError] = useState<string | null>(null)
  const [model, setModel] = useState<SegmentationModelType>('unet')

  const inferred = useMemo(() => {
    if (!files?.length) return null
    try {
      return detectVolumeFormat(files)
    } catch {
      return null
    }
  }, [files])

  const uploadMut = useMutation({
    mutationFn: async () => {
      if (!files?.length) throw new Error('Select files first')
      return uploadVolume(repos.volumes, files)
    },
    onSuccess: async (volume) => {
      await queryClient.invalidateQueries({ queryKey: ['analytics'] })
      const job = await createSegmentationJob(repos.jobs, volume.id, model, {
        volumeDisplayName: volume.displayName,
        ...(session?.user.email
          ? { notificationEmail: session.user.email }
          : {}),
      })
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      router.push(`/jobs/${job.id}`)
    },
  })

  const onFilesSelected = (next: File[]) => {
    setFiles(next)
    try {
      detectVolumeFormat(next)
      setFormatError(null)
    } catch (e) {
      setFormatError(e instanceof Error ? e.message : 'Invalid selection')
    }
  }

  const canSubmit =
    files &&
    files.length > 0 &&
    !formatError &&
    inferred !== null &&
    !uploadMut.isPending

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Upload 3D volume</h1>
        <p className="mt-1 text-sm text-muted">
          NIfTI (single file) or DICOM (multiple .dcm files or one ZIP).
        </p>
      </header>

      <VolumeDropzone
        onFilesSelected={onFilesSelected}
        disabled={uploadMut.isPending}
      />

      {formatError ? (
        <p className="mt-2 text-sm text-danger">{formatError}</p>
      ) : null}

      {files && inferred === 'nifti' && files[0] ? (
        <NiftiPreview file={files[0]} />
      ) : null}

      {files && inferred === 'dicom' ? (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-2 font-medium text-white">DICOM</h2>
          <p className="text-sm text-muted">
            {files.length} file(s) selected. Full in-browser DICOM viewing can
            be added with Cornerstone3D; for this build we validate the selection
            and run the segmentation pipeline.
          </p>
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <label className="mb-4 flex flex-col gap-1 text-sm">
          <span className="text-slate-300">Model</span>
          <select
            className={inputClass}
            value={model}
            onChange={(e) => setModel(e.target.value as SegmentationModelType)}
            disabled={uploadMut.isPending}
          >
            {SEGMENTATION_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          disabled={!canSubmit}
          onClick={() => uploadMut.mutate()}
        >
          {uploadMut.isPending ? 'Uploading…' : 'Upload & segment'}
        </button>
      </div>

      {uploadMut.error ? (
        <p className="mt-3 text-sm text-danger">
          {uploadMut.error instanceof Error
            ? uploadMut.error.message
            : 'Upload failed'}
        </p>
      ) : null}
    </div>
  )
}
