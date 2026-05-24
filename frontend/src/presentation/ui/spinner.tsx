interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className = '', label = 'Loading' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
