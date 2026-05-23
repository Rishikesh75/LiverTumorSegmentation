import type { AppServices } from '@lib/composition'
import { createContext, useContext, type ReactNode } from 'react'

const AppServicesContext = createContext<AppServices | null>(null)

export function AppServicesProvider({
  value,
  children,
}: {
  value: AppServices
  children: ReactNode
}) {
  return (
    <AppServicesContext.Provider value={value}>
      {children}
    </AppServicesContext.Provider>
  )
}

export function useAppServices(): AppServices {
  const ctx = useContext(AppServicesContext)
  if (!ctx) {
    throw new Error('AppServicesProvider is missing')
  }
  return ctx
}
