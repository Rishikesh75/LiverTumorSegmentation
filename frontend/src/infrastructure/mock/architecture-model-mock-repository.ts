import type { ArchitectureModelRepository } from '@domain/repositories/architecture-model-repository'

const MOCK_ARCHITECTURE_MODELS = [
  'unet',
  'unet++',
  'attention',
  'trans-unet',
  'ensemble',
]

export function createArchitectureModelMockRepository(): ArchitectureModelRepository {
  return {
    async list(): Promise<string[]> {
      return [...MOCK_ARCHITECTURE_MODELS]
    },
  }
}
