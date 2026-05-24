'use client'

import { UploadError } from '@domain/models/upload-error'
import type { SegmentationJob } from '@domain/models/segmentation-job'
import type { Volume, VolumeFormat } from '@domain/models/volume'
import {
  createSegmentationJobUseCase,
  listArchitectureModelsUseCase,
  uploadVolumeUseCase,
} from '@lib/composition'
import { MOCK_ARCHITECTURE_MODEL_OPTIONS } from '@/src/constants/architecture-models'
import { queryKeys } from '@/src/constants/query-keys'
import type { UploadSource } from '@presentation/ui/upload-source-tabs'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

export type UploadWorkflowStep =
  | 'upload'
  | 'selectModel'
  | 'creatingJob'
  | 'done'

export function useUploadWorkflow() {
  const [source, setSource] = useState<UploadSource>('local')
  const [format, setFormat] = useState<VolumeFormat>('nifti')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedVolume, setUploadedVolume] = useState<Volume | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>(MOCK_ARCHITECTURE_MODEL_OPTIONS[0])
  const [createdJob, setCreatedJob] = useState<SegmentationJob | null>(null)
  const [step, setStep] = useState<UploadWorkflowStep>('upload')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [jobError, setJobError] = useState<string | null>(null)

  const architectureModelsQuery = useQuery({
    queryKey: queryKeys.architectureModels.all,
    queryFn: listArchitectureModelsUseCase,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, volumeFormat }: { file: File; volumeFormat: VolumeFormat }) =>
      uploadVolumeUseCase(file, volumeFormat),
    onSuccess: (volume) => {
      setUploadedVolume(volume)
      setUploadError(null)
      setStep('selectModel')
    },
    onError: (error: unknown) => {
      if (error instanceof UploadError) {
        setUploadError(error.message)
      } else {
        setUploadError('Upload failed. Please try again.')
      }
    },
  })

  const createJobMutation = useMutation({
    mutationFn: createSegmentationJobUseCase,
    onSuccess: (job) => {
      setCreatedJob(job)
      setJobError(null)
      setStep('done')
    },
    onError: () => {
      setJobError('Failed to start segmentation job. Please try again.')
      setStep('selectModel')
    },
  })

  const uploadFile = useCallback(() => {
    if (!selectedFile || !selectedModel) return
    setUploadError(null)
    uploadMutation.mutate({ file: selectedFile, volumeFormat: format })
  }, [selectedFile, selectedModel, format, uploadMutation])

  const startSegmentation = useCallback(() => {
    if (!uploadedVolume || !selectedModel) return
    setJobError(null)
    setStep('creatingJob')
    createJobMutation.mutate({
      volumeId: uploadedVolume.id,
      modelType: selectedModel,
      volumeDisplayName: uploadedVolume.displayName,
    })
  }, [uploadedVolume, selectedModel, createJobMutation])

  const reset = useCallback(() => {
    setSource('local')
    setFormat('nifti')
    setSelectedFile(null)
    setUploadedVolume(null)
    setCreatedJob(null)
    setStep('upload')
    setUploadError(null)
    setJobError(null)
    uploadMutation.reset()
    createJobMutation.reset()
    const models = architectureModelsQuery.data
    setSelectedModel(models?.[0] ?? MOCK_ARCHITECTURE_MODEL_OPTIONS[0])
  }, [uploadMutation, createJobMutation, architectureModelsQuery.data])

  return {
    source,
    setSource,
    format,
    setFormat,
    selectedFile,
    setSelectedFile,
    uploadedVolume,
    selectedModel,
    setSelectedModel,
    createdJob,
    step,
    uploadError,
    jobError,
    architectureModels: architectureModelsQuery.data ?? [],
    isLoadingModels: architectureModelsQuery.isLoading,
    isModelsError: architectureModelsQuery.isError,
    isUploading: uploadMutation.isPending,
    isCreatingJob: createJobMutation.isPending,
    uploadFile,
    startSegmentation,
    reset,
  }
}
