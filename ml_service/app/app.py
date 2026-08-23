#!/usr/bin/env python3

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from config.config import description, title, version
from controllers import health, segmentation, volume_management
from core.logger import setup_logging
from services.model_service import model_service

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Warming up %s model...", model_service.list_available_models()[0])
    model_service.get_model()
    logger.info("Model ready on %s", model_service.device)
    yield


app = FastAPI(
    title=title,
    description=description,
    version=version,
    lifespan=lifespan,
)

app.include_router(health.router)
app.include_router(segmentation.router)
app.include_router(volume_management.router)

if __name__ == "__main__":
    logger.info("Starting Liver Tumor Segmentation ML Service...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5001,
        log_level="info",
    )
