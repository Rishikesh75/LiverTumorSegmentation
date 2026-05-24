import type { Volume } from '@domain/models/volume'
import { Badge } from '@presentation/ui/badge'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface UploadSuccessSummaryProps {
  volume: Volume
}

export function UploadSuccessSummary({ volume }: UploadSuccessSummaryProps) {
  return (
    <div className="rounded-lg border border-success/30 bg-success/5 p-4">
      <p className="text-sm font-medium text-success">Upload successful</p>
      <div className="mt-3 space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">File: </span>
          {volume.displayName}
        </p>
        <p>
          <span className="text-muted-foreground">Size: </span>
          {formatBytes(volume.sizeBytes)}
        </p>
        <p>
          <span className="text-muted-foreground">Volume ID: </span>
          <span className="font-mono text-xs">{volume.id}</span>
        </p>
        <Badge variant="muted" className="mt-2">
          {volume.format.toUpperCase()}
        </Badge>
      </div>
    </div>
  )
}
