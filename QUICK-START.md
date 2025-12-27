# 🚀 Quick Start Guide

## Start Services (Windows)

```powershell
# Option 1: Use the convenience script
.\start-services.ps1

# Option 2: Manual Docker Compose
docker-compose up --build -d
```

## Stop Services

```powershell
# Option 1: Use the convenience script
.\stop-services.ps1

# Option 2: Manual Docker Compose
docker-compose down
```

## Verify Services

```powershell
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:5000/health    # ML Service
curl http://localhost:8080/api/health # Backend Service
```

## Next Steps

1. **Add Your Models**: Place trained models in `ml-service/models/`
2. **Update Code**: Implement model loading in `ml-service/app.py`
3. **Test**: Upload an image and run segmentation

## Key Files

- `docker-compose.yml` - Service orchestration
- `README-DOCKER.md` - Complete Docker documentation
- `MIGRATION-COMPLETE.md` - Migration details and architecture
- `ml-service/app.py` - ML inference service
- `backend/src/.../MLServiceClient.java` - Backend-to-ML communication

## Useful Commands

```powershell
# View specific service logs
docker-compose logs -f ml-service
docker-compose logs -f backend-service

# Restart a service
docker-compose restart ml-service

# Rebuild after code changes
docker-compose build ml-service
docker-compose up -d ml-service

# Clean everything
docker-compose down -v --rmi all
```

## API Testing

```powershell
# Upload image
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/upload" -Method Post -Form @{file=Get-Item "test.png"}

# Perform segmentation
$body = @{
    imagePath = $response.fileName
    modelType = "unet"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/segment" -Method Post -Body $body -ContentType "application/json"
```

## 📚 More Information

- Full documentation: `README-DOCKER.md`
- Migration details: `MIGRATION-COMPLETE.md`
- ML Service docs: `ml-service/README.md`

