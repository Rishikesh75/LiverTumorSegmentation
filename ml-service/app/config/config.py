from pathlib import Path

UPLOAD_DIR = Path("../backend/uploads")
OUTPUT_DIR = Path("../backend/outputs")
MODELS_DIR = Path("models")

VALID_MODELS = ["unet", "unet++", "attention", "trans-unet", "ensemble"]

title: str = "Liver Tumor Segmentation ML Service"
description: str = "Microservice for ML model inference"
version: str = "1.0.0"
