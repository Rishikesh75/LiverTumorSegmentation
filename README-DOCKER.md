# Liver Tumor Segmentation - Microservice Architecture with Docker

## 🏗️ Architecture Overview

This application implements a microservice architecture with:

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend  │────────▶│  Backend Service │────────▶│   ML Service    │
│  (Angular)  │         │  (Spring Boot)   │         │    (FastAPI)    │
│  Port 4200  │         │    Port 8080     │         │    Port 5000    │
└─────────────┘         └──────────────────┘         └─────────────────┘
                              │                              │
                              ▼                              ▼
                        ┌──────────┐                  ┌──────────┐
                        │  Uploads │                  │  Models  │
                        │  Outputs │                  │  (*.h5)  │
                        └──────────┘                  └──────────┘
```

### Services:

1. **ML Service** (Python FastAPI) - Port 5000
   - Handles model inference
   - Supports multiple segmentation models (UNet, UNet++, Attention, Trans-UNet, Ensemble)
   - RESTful API for predictions
   - Lightweight and scalable

2. **Backend Service** (Java Spring Boot) - Port 8080
   - Business logic orchestration
   - File upload/download management
   - Client-facing REST API
   - Communicates with ML service via HTTP

3. **Frontend** (Angular) - Port 4200
   - User interface
   - Image upload and visualization
   - Segmentation results display

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** v3.8 or higher
- At least **8GB RAM** available for Docker
- At least **10GB disk space** for images and models

### Verify Installation

```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
cd C:\Users\kreddy\Documents\LiverTumorSegmentation
```

### 2. Prepare Your Models

Place your trained models in the `ml-service/models/` directory:

```bash
ml-service/models/
├── unet_model.h5
├── unet_plus_plus_model.h5
├── attention_model.h5
├── trans_unet_model.h5
└── ensemble_weights.pkl
```

### 3. Build and Start All Services

```bash
# Build and start in detached mode
docker-compose up --build -d

# Or run in foreground to see logs
docker-compose up --build
```

### 4. Verify Services are Running

```bash
# Check container status
docker-compose ps

# Check ML service health
curl http://localhost:5000/health

# Check backend service health
curl http://localhost:8080/api/health
```

### 5. Access the Application

- **Backend API**: http://localhost:8080
- **ML Service**: http://localhost:5000
- **Frontend**: http://localhost:4200 (if configured)
- **API Documentation**: http://localhost:5000/docs (FastAPI auto-generated)

## 📖 Usage

### Using the API

#### 1. Upload an Image

```bash
curl -X POST http://localhost:8080/api/upload \
  -F "file=@path/to/your/image.png"
```

Response:
```json
{
  "fileName": "image_12345.png",
  "message": "File uploaded successfully"
}
```

#### 2. Get Available Models

```bash
curl http://localhost:8080/api/models
```

Response:
```json
["unet", "unet++", "attention", "trans-unet", "ensemble"]
```

#### 3. Perform Segmentation

```bash
curl -X POST http://localhost:8080/api/segment \
  -H "Content-Type: application/json" \
  -d '{
    "imagePath": "image_12345.png",
    "modelType": "unet"
  }'
```

Response:
```json
{
  "message": "Segmentation completed successfully",
  "outputPath": "segmented_unet_image_12345_a1b2.png",
  "inputPath": "image_12345.png",
  "success": true,
  "modelUsed": "unet"
}
```

#### 4. Retrieve Segmented Image

```bash
curl http://localhost:8080/api/images/segmented_unet_image_12345_a1b2.png?type=output \
  --output result.png
```

## 🔧 Development

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ml-service
docker-compose logs -f backend-service

# Last 100 lines
docker-compose logs --tail=100 ml-service
```

### Stopping Services

```bash
# Stop all services (containers remain)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers, volumes, and images
docker-compose down -v --rmi all
```

### Rebuilding Services

```bash
# Rebuild specific service
docker-compose build ml-service
docker-compose up -d ml-service

# Rebuild all services
docker-compose build
docker-compose up -d
```

### Accessing Container Shell

```bash
# ML Service
docker-compose exec ml-service /bin/bash

# Backend Service
docker-compose exec backend-service /bin/sh
```

### Local Development (Without Docker)

#### Backend Service

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### ML Service

```bash
cd ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python app.py
```

## 🎯 API Endpoints Reference

### Backend Service (Port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/models` | Get available models |
| POST | `/api/upload` | Upload image |
| POST | `/api/segment` | Perform segmentation |
| GET | `/api/images/{filename}?type=upload\|output` | Retrieve image |

### ML Service (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service information |
| GET | `/health` | Health check |
| GET | `/models` | Get available models |
| POST | `/segment` | Perform segmentation |
| POST | `/upload` | Upload image (for testing) |
| GET | `/images/{filename}?type=upload\|output` | Retrieve image |
| GET | `/docs` | Interactive API documentation |

## 🐛 Troubleshooting

### ML Service Won't Start

**Problem**: Container exits immediately

**Solutions**:
```bash
# Check logs
docker-compose logs ml-service

# Common issues:
# 1. Port 5000 already in use
netstat -ano | findstr :5000
# Kill the process using the port

# 2. Insufficient memory
# Increase Docker memory in Docker Desktop settings (minimum 8GB)

# 3. Python dependencies failed to install
docker-compose build --no-cache ml-service
```

### Backend Can't Connect to ML Service

**Problem**: Connection refused errors

**Solutions**:
```bash
# 1. Verify ML service is healthy
docker-compose ps
curl http://localhost:5000/health

# 2. Check network connectivity
docker-compose exec backend-service ping ml-service

# 3. Verify environment variables
docker-compose exec backend-service env | grep ML_SERVICE

# 4. Check ML service URL in backend logs
docker-compose logs backend-service | grep "ML service"
```

### File Upload Issues

**Problem**: Files not uploading or not found

**Solutions**:
```bash
# 1. Check volume mounts
docker-compose exec backend-service ls -la /app/uploads

# 2. Check permissions
docker-compose exec backend-service ls -ld /app/uploads

# 3. Verify file size limits
# Check application.properties:
# spring.servlet.multipart.max-file-size=50MB
```

### Slow Performance

**Problem**: Inference takes too long

**Solutions**:
- Increase Docker CPU allocation (Docker Desktop settings)
- Use GPU acceleration (requires nvidia-docker and GPU-enabled images)
- Optimize model loading (cache models in memory)
- Use smaller models for testing

## 🚀 Production Deployment

### Environment Variables

Create a `.env` file:

```env
# ML Service
ML_SERVICE_URL=http://ml-service:5000
ML_SERVICE_TIMEOUT=300000
PYTHONUNBUFFERED=1

# Backend
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8080

# Security (add your own)
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://yourdomain.com
```

### Using Named Volumes (Production)

Update `docker-compose.yml`:

```yaml
services:
  ml-service:
    volumes:
      - ml-uploads:/app/../backend/uploads
      - ml-outputs:/app/../backend/outputs
      - ml-models:/app/models

volumes:
  ml-uploads:
  ml-outputs:
  ml-models:
  backend-uploads:
  backend-outputs:
```

### Scaling Services

```bash
# Scale ML service to 3 instances
docker-compose up -d --scale ml-service=3

# Use a load balancer (nginx) in front
```

### Security Best Practices

1. **Use HTTPS** - Add nginx reverse proxy with SSL
2. **Authentication** - Implement JWT or OAuth2
3. **Rate Limiting** - Add rate limiting to APIs
4. **Input Validation** - Validate all file uploads
5. **Secrets Management** - Use Docker secrets or vault
6. **Network Isolation** - Use private networks
7. **Regular Updates** - Keep images up to date

### Monitoring

```bash
# Resource usage
docker stats

# Container health
docker-compose ps
```

## 📁 Directory Structure

```
LiverTumorSegmentation/
├── backend/                      # Java Spring Boot service
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── uploads/                  # Runtime uploads
│   └── outputs/                  # Runtime outputs
│
├── ml-service/                   # Python ML service
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── models/                   # Trained models (.h5, .pkl)
│   └── utils/
│
├── frontend/                     # Angular frontend
│   └── src/
│
├── training/                     # Training notebooks (not in containers)
│   ├── notebooks/
│   └── outputs/
│
├── docker-compose.yml            # Orchestration
└── README-DOCKER.md             # This file
```

## 🔄 CI/CD Pipeline Example

```yaml
# .github/workflows/docker-build.yml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build ML Service
        run: docker build -t myrepo/ml-service:latest ./ml-service
      
      - name: Build Backend Service
        run: docker build -t myrepo/backend-service:latest ./backend
      
      - name: Push to Registry
        run: |
          docker push myrepo/ml-service:latest
          docker push myrepo/backend-service:latest
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker-compose up --build`
5. Submit a pull request

## 📝 License

[Your License Here]

## 👥 Support

For issues and questions:
- Open an issue on GitHub
- Contact: [Your Contact]

---

**Happy Segmenting! 🎯**

