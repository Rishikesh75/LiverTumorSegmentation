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

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── segmentation/      # Main segmentation component
│   │   ├── models/                # TypeScript interfaces
│   │   ├── services/              # API services
│   │   ├── app.component.*        # Root component
│   │   ├── app.config.ts          # App configuration
│   │   └── app.routes.ts          # Routing configuration
│   ├── assets/                    # Static assets
│   ├── index.html                 # Main HTML file
│   └── styles.css                 # Global styles
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
