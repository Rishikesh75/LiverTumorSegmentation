import { Niivue } from '@niivue/niivue'
import { useEffect, useRef, useState } from 'react'

type Props = {
  file: File
}

export function NiftiPreview({ file }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    host.replaceChildren()
    const canvas = document.createElement('canvas')
    canvas.className = 'nifti-canvas'
    canvas.width = 640
    canvas.height = 480
    host.appendChild(canvas)

    let cancelled = false
    let objectUrl: string | null = null
    const nv = new Niivue()

    ;(async () => {
      try {
        setError(null)
        objectUrl = URL.createObjectURL(file)
        await nv.attachToCanvas(canvas)
        if (cancelled) return
        await nv.loadVolumes([{ url: objectUrl }])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load NIfTI preview')
        }
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      host.replaceChildren()
    }
  }, [file])

  return (
    <div className="nifti-preview">
      <p className="nifti-preview-caption">NIfTI preview (Niivue)</p>
      {error ? <p className="form-error">{error}</p> : null}
      <div ref={hostRef} className="nifti-preview-host" />
    </div>
  )
}
