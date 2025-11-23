/**
 * Domain Layer - Public API
 * Exports all domain entities, value objects, and interfaces
 */

// Entities
export * from './entities/image.entity';
export * from './entities/segmentation.entity';

// Value Objects
export * from './value-objects/image-path.vo';
export * from './value-objects/model-type.vo';

// Interfaces
export * from './interfaces/segmentation-repository.interface';

// Enums
export * from './enums/segmentation-status.enum';

