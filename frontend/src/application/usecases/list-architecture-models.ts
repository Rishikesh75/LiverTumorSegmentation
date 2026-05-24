import type { ArchitectureModelRepository } from '@domain/repositories/architecture-model-repository'

export function createListArchitectureModelsUseCase(repository: ArchitectureModelRepository) {
  return (): Promise<string[]> => repository.list()
}
