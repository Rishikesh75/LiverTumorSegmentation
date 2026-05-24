'use client'

import { useSegmentationProducts } from '@presentation/hooks/use-segmentation-products'
import { AppShellLayout } from '@presentation/layouts/app-shell-layout'
import { Alert } from '@presentation/ui/alert'
import { ModelCard } from '@presentation/ui/model-card'
import { Spinner } from '@presentation/ui/spinner'

export function ModelsPageContent() {
  const { data: products, isLoading, isError } = useSegmentationProducts()

  return (
    <AppShellLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Select a segmentation model</h1>
          <p className="mt-2 text-muted-foreground">
            Choose the anatomical model that matches your imaging study. Upload and inference flows are enabled per model.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner label="Loading models" />
          </div>
        )}

        {isError && <Alert>Unable to load segmentation models. Please refresh the page.</Alert>}

        {products && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
            {products.map((product) => (
              <ModelCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </AppShellLayout>
  )
}
