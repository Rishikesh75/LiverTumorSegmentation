'use client'

import { isMockApiEnabled } from '@lib/composition'
import { Alert } from '@presentation/ui/alert'
import { Button } from '@presentation/ui/button'
import { Input } from '@presentation/ui/input'
import { Label } from '@presentation/ui/label'
import { FormEvent, useState } from 'react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  error?: string | null
  isLoading?: boolean
}

export function LoginForm({ onSubmit, error, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState(isMockApiEnabled ? 'demo@example.com' : '')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert>{error}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@hospital.org"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(error)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(error)}
          required
        />
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        Sign in
      </Button>

      {isMockApiEnabled && (
        <p className="text-center text-sm text-muted-foreground">
          Mock mode: use any email with password <span className="font-mono">demo</span>
        </p>
      )}
    </form>
  )
}
