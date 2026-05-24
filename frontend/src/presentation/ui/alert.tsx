type AlertVariant = 'error' | 'info'

interface AlertProps {
  children: React.ReactNode
  variant?: AlertVariant
  className?: string
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'border-destructive/30 bg-destructive/5 text-destructive',
  info: 'border-accent/30 bg-accent/5 text-accent',
}

export function Alert({ children, variant = 'error', className = '' }: AlertProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  )
}
