from fastapi import APIRouter

from config.config import title, version
from services.model_service import ModelService

router = APIRouter(tags=["health"])
model_service = ModelService()


@router.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": title,
        "version": version,
        "status": "running",
    }


@router.get("/health")
async def health_check():
    """Health check endpoint for service monitoring."""
    return {
        "status": "healthy",
        "service": "ML Inference Service",
    }
