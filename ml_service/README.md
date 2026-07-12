# ML Inference Microservice

This is the Python-based ML inference microservice for Liver Tumor Segmentation.

## Features

- **FastAPI-based REST API** for model inference
- **Multiple Model Support**: UNet, UNet++, Attention UNet, Trans-UNet, Ensemble
- **Dockerized** for easy deployment
- **Health checks** for monitoring

## Local Development

### Prerequisites

- Python 3.10+
- pip

### Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### Health Check
```bash
GET /health
```

### Get Available Models
```bash
GET /models
```

### Perform Segmentation
```bash
POST /segment
Content-Type: application/json

{
  "image_path": "uploaded_image.png",
  "model_type": "unet"
}
```

### Upload Image (for testing)
```bash
POST /upload
Content-Type: multipart/form-data

file: <image_file>
```

## Docker

### Build
```bash
docker build -t ml-service .
```

### Run
```bash
docker run -p 5000:5000 ml-service
```

## Model Setup

Place your trained models in the `models/` directory:

- `unet_model.h5` - UNet model
- `unet_plus_plus_model.h5` - UNet++ model
- `attention_model.h5` - Attention UNet model
- `trans_unet_model.h5` - Trans-UNet model
- `ensemble_weights.pkl` - Ensemble model weights

## TODO

- [ ] Implement actual model loading in `load_model()`
- [ ] Implement preprocessing based on training pipeline
- [ ] Implement postprocessing for segmentation masks
- [ ] Add model caching for better performance
- [ ] Add request validation and error handling
- [ ] Add logging to file
- [ ] Add metrics collection

## Architecture

This microservice is part of a larger architecture:
- **Backend Service** (Java Spring Boot) - Handles file uploads and business logic
- **ML Service** (This service) - Performs model inference
- **Frontend** (Angular) - User interface

See the root `README-DOCKER.md` for full architecture documentation.

