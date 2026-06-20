#!/usr/bin/env python3

import logging

import uvicorn
from fastapi import FastAPI

from config.config import description, title, version
from controllers import health, images, segmentation, upload
from core.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=title,
    description=description,
    version=version,
)

app.include_router(health.router)
app.include_router(segmentation.router)
app.include_router(upload.router)
app.include_router(images.router)

if __name__ == "__main__":
    logger.info("Starting Liver Tumor Segmentation ML Service...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5001,
        log_level="info",
    )
