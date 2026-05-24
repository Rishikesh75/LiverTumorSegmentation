import type { SegmentationJob } from '@domain/models/segmentation-job'
import { Badge } from '@presentation/ui/badge'

interface JobCreatedSummaryProps {
  job: SegmentationJob
}

export function JobCreatedSummary({ job }: JobCreatedSummaryProps) {
  return (
    <div className="rounded-lg border border-success/30 bg-success/5 p-4">
      <p className="text-sm font-medium text-success">Segmentation job started</p>
      <div className="mt-3 space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">Job ID: </span>
          <span className="font-mono text-xs">{job.id}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Model: </span>
          {job.modelType}
        </p>
        <p>
          <span className="text-muted-foreground">Volume: </span>
          {job.volumeName ?? job.volumeId}
        </p>
        <Badge variant="success" className="mt-2 capitalize">
          {job.status}
        </Badge>
      </div>
    </div>
  )
}
