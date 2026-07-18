from pathlib import Path

# .../LiverTumorSegmentation/ml-service/app
BASE_DIR = Path(__file__).resolve().parents[1]
# .../LiverTumorSegmentation/ml-service
SERVICE_DIR = BASE_DIR.parent
# .../LiverTumorSegmentation
PROJECT_ROOT = SERVICE_DIR.parent

UPLOAD_DIR = SERVICE_DIR / "resources" / "uploads"
OUTPUT_DIR = SERVICE_DIR / "resources" / "outputs"
MODELS_DIR = BASE_DIR / "ml_models"

VALID_MODELS = ["unet", "unet++", "attention", "trans-unet", "ensemble", "resunet"]


title: str = "Liver Tumor Segmentation ML Service"
description: str = "Microservice for ML model inference"
version: str = "1.0.0"
