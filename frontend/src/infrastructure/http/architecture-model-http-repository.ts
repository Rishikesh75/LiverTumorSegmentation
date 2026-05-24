import type { ArchitectureModelRepository } from '@domain/repositories/architecture-model-repository'
import type { HttpClient } from '@infrastructure/http/http-client'

export function createArchitectureModelHttpRepository(
  httpClient: HttpClient,
): ArchitectureModelRepository {
  return {
    async list(): Promise<string[]> {
      return httpClient.get<string[]>('/api/models')
    },
  }
}
