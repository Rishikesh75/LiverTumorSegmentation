/**
 * Application Layer - Public API
 * Exports facades, use cases, and DTOs
 */

// Facades
export * from './facades/segmentation.facade';

// Use Cases
export * from './use-cases/upload-image.use-case';
export * from './use-cases/perform-segmentation.use-case';
export * from './use-cases/get-available-models.use-case';

// DTOs
export * from './dtos/segmentation-request.dto';
export * from './dtos/segmentation-response.dto';

