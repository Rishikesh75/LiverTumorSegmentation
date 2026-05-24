'use client'

import { ROUTES } from '@/src/constants/routes'
import { useAuth } from '@presentation/hooks/use-auth'
import { AuthLayout } from '@presentation/layouts/auth-layout'
import { LoginForm } from '@presentation/ui/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@presentation/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LoginPageContent() {
  const { login, error, isAuthenticated, isLoading, clearError } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.models)
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    clearError()
  }, [clearError])

  async function handleLogin(email: string, password: string) {
    setIsSubmitting(true)
    try {
      await login(email, password)
      router.push(ROUTES.models)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your segmentation workspace with your institutional account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleLogin} error={error} isLoading={isSubmitting} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
