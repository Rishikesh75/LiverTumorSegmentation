'use client'

import { AuthContext } from '@presentation/providers/auth-provider'
import { useContext } from 'react'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
