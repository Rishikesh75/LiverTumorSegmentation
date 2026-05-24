import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-accent p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Medical Imaging AI</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">LiverSeg Pro</h1>
          <p className="mt-4 max-w-md text-lg opacity-90">
            Upload, segment, and analyze medical volumes with specialized deep learning models.
          </p>
        </div>
        <p className="text-sm opacity-75">Secure session-based access for clinical research workflows.</p>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
