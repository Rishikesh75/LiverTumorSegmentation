'use client'

import { Label } from '@presentation/ui/label'
import { Spinner } from '@presentation/ui/spinner'

interface ArchitectureModelPickerProps {
  models: string[]
  selectedModel: string | null
  onSelect: (model: string) => void
  isLoading?: boolean
  isError?: boolean
}

function formatModelLabel(model: string): string {
  return model
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function ArchitectureModelPicker({
  models,
  selectedModel,
  onSelect,
  isLoading = false,
  isError = false,
}: ArchitectureModelPickerProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner label="Loading models" />
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load architecture models.</p>
  }

  return (
    <div className="space-y-3">
      <Label>Select architecture model</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {models.map((model) => (
          <label
            key={model}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
              selectedModel === model
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="architecture-model"
              value={model}
              checked={selectedModel === model}
              onChange={() => onSelect(model)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-medium">{formatModelLabel(model)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
