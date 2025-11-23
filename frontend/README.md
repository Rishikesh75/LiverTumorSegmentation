# Liver Tumor Segmentation - Frontend

Angular application for liver tumor segmentation using various deep learning models.

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 17

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Development Server

Run the development server:

```bash
npm start
```

or

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Build the project for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Features

- Upload liver scan images
- Select from multiple segmentation models:
  - UNet
  - UNet++
  - Attention UNet
  - Trans-UNet
  - Ensemble
- View original and segmented images side-by-side
- Responsive design with modern UI

## Architecture

This project follows a **Layered Architecture** pattern with clear separation of concerns. For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Layers:

1. **Presentation Layer** (`src/app/presentation/`) - UI components and views
2. **Application Layer** (`src/app/application/`) - Business logic, use cases, and facades
3. **Domain Layer** (`src/app/domain/`) - Core business entities and rules
4. **Infrastructure Layer** (`src/app/infrastructure/`) - External services and API clients
5. **Core/Shared Layer** (`src/app/core/`) - Common utilities and configuration

### Benefits:
- ✅ Clear separation of concerns
- ✅ Highly testable and maintainable
- ✅ Technology-independent business logic
- ✅ Easy to scale and extend
- ✅ Framework-agnostic core

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── presentation/          # Presentation Layer
│   │   │   ├── components/
│   │   │   │   └── segmentation/  # Main segmentation component
│   │   │   └── view-models/       # Component state management
│   │   ├── application/           # Application Layer
│   │   │   ├── facades/           # Simplified interfaces
│   │   │   ├── use-cases/         # Business operations
│   │   │   └── dtos/              # Data transfer objects
│   │   ├── domain/                # Domain Layer
│   │   │   ├── entities/          # Core business objects
│   │   │   ├── value-objects/     # Immutable value objects
│   │   │   ├── interfaces/        # Domain contracts
│   │   │   └── enums/             # Domain enumerations
│   │   ├── infrastructure/        # Infrastructure Layer
│   │   │   ├── services/          # HTTP services
│   │   │   ├── repositories/      # Data access implementations
│   │   │   └── adapters/          # API response adapters
│   │   ├── core/                  # Core/Shared Layer
│   │   │   ├── config/            # Configuration
│   │   │   ├── constants/         # Application constants
│   │   │   ├── types/             # Common types
│   │   │   ├── utils/             # Utilities
│   │   │   └── providers/         # Dependency injection
│   │   ├── app.component.*        # Root component
│   │   ├── app.config.ts          # App configuration
│   │   └── app.routes.ts          # Routing configuration
│   ├── assets/                    # Static assets
│   ├── index.html                 # Main HTML file
│   └── styles.css                 # Global styles
├── ARCHITECTURE.md                # Detailed architecture documentation
├── angular.json                   # Angular CLI configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## API Integration

The frontend communicates with the Spring Boot backend running on `http://localhost:8080`.

API endpoints used:
- `GET /api/models` - Get available models
- `POST /api/upload` - Upload image
- `POST /api/segment` - Perform segmentation
- `GET /api/images/{fileName}` - Retrieve images

## License

MIT
