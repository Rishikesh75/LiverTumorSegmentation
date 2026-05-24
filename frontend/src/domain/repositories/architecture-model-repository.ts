export interface ArchitectureModelRepository {
  list(): Promise<string[]>
}
