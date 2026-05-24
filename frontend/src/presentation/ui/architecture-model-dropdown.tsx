'use client'

import { formatArchitectureModelLabel } from '@/src/constants/architecture-models'
import { Label } from '@presentation/ui/label'
import { Spinner } from '@presentation/ui/spinner'

interface ArchitectureModelDropdownProps {
  models: string[]
  selectedModel: string | null
  onSelect: (model: string) => void
  isLoading?: boolean
  isError?: boolean
  disabled?: boolean
}

export function ArchitectureModelDropdown({
  models,
  selectedModel,
  onSelect,
  isLoading = false,
  isError = false,
  disabled = false,
}: ArchitectureModelDropdownProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Segmentation model</Label>
        <div className="flex h-10 items-center">
          <Spinner label="Loading models" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <Label>Segmentation model</Label>
        <p className="text-sm text-destructive">Failed to load models.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="architecture-model">Segmentation model</Label>
      <select
        id="architecture-model"
        value={selectedModel ?? ''}
        onChange={(event) => onSelect(event.target.value)}
        disabled={disabled || models.length === 0}
        className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>
          Select a model
        </option>
        {models.map((model) => (
          <option key={model} value={model}>
            {formatArchitectureModelLabel(model)}
          </option>
        ))}
      </select>
    </div>
  )
}
