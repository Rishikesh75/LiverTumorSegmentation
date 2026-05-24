import type { SegmentationProduct } from '@domain/models/segmentation-product'
import { ROUTES } from '@/src/constants/routes'
import Link from 'next/link'
import { Badge } from '@presentation/ui/badge'
import { Button } from '@presentation/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@presentation/ui/card'

interface ModelCardProps {
  product: SegmentationProduct
}

function ProductIcon({ iconKey }: { iconKey: string }) {
  const icons: Record<string, React.ReactNode> = {
    liver: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
        <path
          d="M12 3c-2 2-4 4-4 7 0 3 2 5 4 7 2-2 4-4 4-7 0-3-2-5-4-7z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="currentColor"
          fillOpacity="0.15"
        />
      </svg>
    ),
    brain: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <path d="M8 10c1 1 2 1 4 0M12 10v4M16 10c-1 1-2 1-4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    lung: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
        <path
          d="M12 4v16M8 8c-2 2-2 6 0 8M16 8c2 2 2 6 0 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    kidney: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
        <path
          d="M14 6c3 0 5 3 5 6s-2 6-5 6c-2 0-3-1-4-3-1 2-2 3-4 3-3 0-5-3-5-6s2-6 5-6c2 0 3 1 4 3 1-2 2-3 4-3z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="currentColor"
          fillOpacity="0.15"
        />
      </svg>
    ),
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
      {icons[iconKey] ?? icons.liver}
    </div>
  )
}

export function ModelCard({ product }: ModelCardProps) {
  const isAvailable = product.status === 'available'

  return (
    <Card
      className={`relative flex h-full flex-col transition-shadow ${isAvailable ? 'hover:shadow-[var(--shadow-card-hover)]' : 'opacity-70'}`}
    >
      {!isAvailable && (
        <div className="absolute right-4 top-4 z-10">
          <Badge variant="warning">Coming Soon</Badge>
        </div>
      )}
      <CardHeader>
        <div className="mb-3">
          <ProductIcon iconKey={product.iconKey} />
        </div>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {product.supportedFormats.map((format) => (
            <Badge key={format} variant="muted">
              {format}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {isAvailable ? (
          <Link href={ROUTES.upload(product.id)} className="w-full">
            <Button className="w-full">Continue</Button>
          </Link>
        ) : (
          <Button className="w-full" disabled>
            Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
