'use client'

import { Badge } from '@presentation/ui/badge'

export type UploadSource = 'local' | 'google-drive'

interface UploadSourceTabsProps {
  value: UploadSource
  onChange: (source: UploadSource) => void
}

export function UploadSourceTabs({ value, onChange }: UploadSourceTabsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange('local')}
        className={`rounded-xl border p-4 text-left transition-colors ${
          value === 'local'
            ? 'border-primary bg-primary/5 ring-2 ring-primary'
            : 'border-border bg-card hover:border-primary/50'
        }`}
      >
        <p className="font-medium">Local file</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload NIfTI or DICOM from your computer
        </p>
      </button>

      <button
        type="button"
        disabled
        className="relative cursor-not-allowed rounded-xl border border-border bg-muted/50 p-4 text-left opacity-70"
      >
        <div className="absolute right-3 top-3">
          <Badge variant="warning">Coming Soon</Badge>
        </div>
        <p className="font-medium">Google Drive</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Import volumes directly from your Drive
        </p>
      </button>
    </div>
  )
}
