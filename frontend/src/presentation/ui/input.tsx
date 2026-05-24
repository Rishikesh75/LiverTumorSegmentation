import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ className = '', error = false, ...props }: InputProps) {
  return (
    <input
      className={`flex h-10 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : 'border-border'} ${className}`}
      {...props}
    />
  )
}
