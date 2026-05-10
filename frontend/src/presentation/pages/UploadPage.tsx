import { createSegmentationJob } from '@application/use-cases/createSegmentationJob'
import { uploadVolume } from '@application/use-cases/uploadVolume'
import {
  SEGMENTATION_MODELS,
  type SegmentationModelType,
} from '@domain/entities/segmentation'
import { detectVolumeFormat } from '@domain/lib/volumeFormat'
import { VolumeDropzone } from '@presentation/components/VolumeDropzone'
import { useAuth } from '@presentation/context/AuthContext'
import { useAppServices } from '@presentation/context/AppServicesContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NiftiPreview = lazy(() =>
  import('@presentation/components/NiftiPreview').then((m) => ({
    default: m.NiftiPreview,
  })),
)

export function UploadPage() {
  const { repos } = useAppServices()
  const { session } = useAuth()
  const navigate = useNavigate()
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
      navigate(`/jobs/${job.id}`)
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
    <div className="page upload-page">
      <header className="page-header">
        <h1>Upload 3D volume</h1>
        <p className="muted">
          NIfTI (single file) or DICOM (multiple .dcm files or one ZIP).
        </p>
      </header>

      <VolumeDropzone onFilesSelected={onFilesSelected} disabled={uploadMut.isPending} />

      {formatError ? <p className="form-error">{formatError}</p> : null}

      {files && inferred === 'nifti' && files[0] ? (
        <Suspense
          fallback={
            <p className="muted" role="status">
              Loading NIfTI preview…
            </p>
          }
        >
          <NiftiPreview file={files[0]} />
        </Suspense>
      ) : null}

      {files && inferred === 'dicom' ? (
        <div className="card dicom-placeholder">
          <h2>DICOM</h2>
          <p className="muted">
            {files.length} file(s) selected. Full in-browser DICOM viewing can be
            added with Cornerstone3D; for this build we validate the selection and
            run the mock segmentation pipeline only.
          </p>
        </div>
      ) : null}

      <div className="card upload-actions">
        <label className="field">
          <span>Model</span>
          <select
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
          className="btn btn-primary"
          disabled={!canSubmit}
          onClick={() => uploadMut.mutate()}
        >
          {uploadMut.isPending ? 'Uploading…' : 'Upload & segment'}
        </button>
      </div>

      {uploadMut.error ? (
        <p className="form-error">
          {uploadMut.error instanceof Error
            ? uploadMut.error.message
            : 'Upload failed'}
        </p>
      ) : null}
    </div>
  )
}
