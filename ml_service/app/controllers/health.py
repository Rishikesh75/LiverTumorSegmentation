from fastapi import APIRouter

from config.config import DEFAULT_MODEL, title, version
from services.model_service import model_service

router = APIRouter(tags=["health"])


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
        "status": "healthy" if model_service.is_loaded else "starting",
        "service": "ML Inference Service",
        "model": DEFAULT_MODEL,
        "model_loaded": model_service.is_loaded,
        "device": str(model_service.device),
    }
