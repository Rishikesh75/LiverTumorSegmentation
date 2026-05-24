'use client'

import type { SegmentationProduct } from '@domain/models/segmentation-product'
import { formatArchitectureModelLabel } from '@/src/constants/architecture-models'
import { ROUTES } from '@/src/constants/routes'
import { getSegmentationProductUseCase } from '@lib/composition'
import { useUploadWorkflow } from '@presentation/hooks/use-upload-workflow'
import { AppShellLayout } from '@presentation/layouts/app-shell-layout'
import { Alert } from '@presentation/ui/alert'
import { ArchitectureModelDropdown } from '@presentation/ui/architecture-model-dropdown'
import { Button } from '@presentation/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@presentation/ui/card'
import { JobCreatedSummary } from '@presentation/ui/job-created-summary'
import { LocalFileUpload } from '@presentation/ui/local-file-upload'
import { UploadSourceTabs } from '@presentation/ui/upload-source-tabs'
import { UploadSuccessSummary } from '@presentation/ui/upload-success-summary'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UploadPageContentProps {
  productId: string
}

export function UploadPageContent({ productId }: UploadPageContentProps) {
  const router = useRouter()
  const [product, setProduct] = useState<SegmentationProduct | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)

  const workflow = useUploadWorkflow()

  useEffect(() => {
    let active = true

    getSegmentationProductUseCase(productId).then((result) => {
      if (!active) return
      if (!result || result.status !== 'available') {
        router.replace(ROUTES.models)
        return
      }
      setProduct(result)
      setIsLoadingProduct(false)
    })

    return () => {
      active = false
    }
  }, [productId, router])

  if (isLoadingProduct || !product) {
    return null
  }

  return (
    <AppShellLayout>
      <div className="space-y-6">
        <nav className="text-sm text-muted-foreground">
          <Link href={ROUTES.models} className="hover:text-foreground">
            Models
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name} upload</h1>
          <p className="mt-1 text-muted-foreground">
            Choose a segmentation model, then upload your volume to start inference.
          </p>
        </div>

        {workflow.step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload source</CardTitle>
              <CardDescription>
                Select a model and import your imaging volume.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UploadSourceTabs value={workflow.source} onChange={workflow.setSource} />

              {workflow.source === 'local' && (
                <>
                  <ArchitectureModelDropdown
                    models={workflow.architectureModels}
                    selectedModel={workflow.selectedModel}
                    onSelect={workflow.setSelectedModel}
                    isLoading={workflow.isLoadingModels}
                    isError={false}
                    disabled={workflow.isUploading}
                  />

                  <LocalFileUpload
                    format={workflow.format}
                    onFormatChange={workflow.setFormat}
                    selectedFile={workflow.selectedFile}
                    onFileSelect={workflow.setSelectedFile}
                    onUpload={workflow.uploadFile}
                    isUploading={workflow.isUploading}
                    canUpload={Boolean(workflow.selectedModel)}
                    error={workflow.uploadError}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {(workflow.step === 'selectModel' || workflow.step === 'creatingJob') &&
          workflow.uploadedVolume && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm segmentation</CardTitle>
                <CardDescription>
                  Your volume is ready. Start segmentation with your selected model.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <UploadSuccessSummary volume={workflow.uploadedVolume} />

                {workflow.selectedModel && (
                  <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                    <p className="text-muted-foreground">Selected model</p>
                    <p className="font-medium">
                      {formatArchitectureModelLabel(workflow.selectedModel)}
                    </p>
                  </div>
                )}

                {workflow.jobError && <Alert>{workflow.jobError}</Alert>}

                <Button
                  className="w-full"
                  disabled={!workflow.selectedModel || workflow.isCreatingJob}
                  isLoading={workflow.isCreatingJob}
                  onClick={workflow.startSegmentation}
                >
                  Start segmentation
                </Button>
              </CardContent>
            </Card>
          )}

        {workflow.step === 'done' && workflow.uploadedVolume && workflow.createdJob && (
          <Card>
            <CardHeader>
              <CardTitle>Job submitted</CardTitle>
              <CardDescription>
                Your segmentation job has been queued and will be processed shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UploadSuccessSummary volume={workflow.uploadedVolume} />
              <JobCreatedSummary job={workflow.createdJob} />

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={workflow.reset}>
                  Upload another file
                </Button>
                <Link href={ROUTES.models}>
                  <Button variant="ghost">Back to models</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShellLayout>
  )
}
