'use client'

import { AppServicesProvider } from '@presentation/context/AppServicesContext'
import { AuthProvider } from '@presentation/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo, useState, type ReactNode } from 'react'
import { createAppServices } from '@lib/composition'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  )
  const services = useMemo(() => createAppServices(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <AppServicesProvider value={services}>
        <AuthProvider>{children}</AuthProvider>
      </AppServicesProvider>
    </QueryClientProvider>
  )
}
