import type { RepositoryBundle } from '@application/ports/repositories'
import { createHttpRepositories } from '@infrastructure/http/httpRepositories'
import { createMockRepositories } from '@infrastructure/mocks/mockRepositories'

export type AppServices = {
  repos: RepositoryBundle
}

function useMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCK_API !== 'false'
}

export function createRepositoryBundle(): RepositoryBundle {
  if (useMockApi()) {
    return createMockRepositories()
  }
  const raw =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
  const baseUrl = raw.replace(/\/$/, '')
  return createHttpRepositories(baseUrl)
}

export function createAppServices(): AppServices {
  return { repos: createRepositoryBundle() }
}
