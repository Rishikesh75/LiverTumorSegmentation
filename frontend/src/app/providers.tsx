import { AppServicesProvider } from '@presentation/context/AppServicesContext'
import { AuthProvider } from '@presentation/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import { createAppServices } from './composition'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  const services = useMemo(() => createAppServices(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <AppServicesProvider value={services}>
        <AuthProvider>{children}</AuthProvider>
      </AppServicesProvider>
    </QueryClientProvider>
  )
}
