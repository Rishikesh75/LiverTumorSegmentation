from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SERVICE_DIR = BASE_DIR.parent

UPLOAD_DIR = SERVICE_DIR / "resources" / "uploads"
OUTPUT_DIR = SERVICE_DIR / "resources" / "outputs"
MODELS_DIR = BASE_DIR / "ml_models"

DEFAULT_MODEL = "resunet"
VALID_MODELS = [DEFAULT_MODEL]
MODEL_FILENAME = "resunet_model.pth"
IMG_SIZE = (128, 128)
INFERENCE_BATCH_SIZE = 8

title: str = "Liver Tumor Segmentation ML Service"
description: str = "Microservice for ML model inference"
version: str = "1.0.0"
