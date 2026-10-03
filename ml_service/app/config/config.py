from collections.abc import Callable
from pathlib import Path

import torch

from ml_service.app.ml_models.models.AttentionUNet import AttentionUNet

BASE_DIR = Path(__file__).resolve().parents[1]
SERVICE_DIR = BASE_DIR.parent

UPLOAD_DIR = SERVICE_DIR / "resources" / "uploads"
OUTPUT_DIR = SERVICE_DIR / "resources" / "outputs"
MODELS_DIR = BASE_DIR / "ml_models"

DEFAULT_MODEL = "attention_unet"
IMG_SIZE = (128, 128)
INFERENCE_BATCH_SIZE = 8


MODEL_REGISTRY: dict[str, tuple[Callable[[], torch.nn.Module], str]] = {
    "attention_unet": (
        lambda: AttentionUNet(in_channels=1, out_channels=3),
        "attention_unet_model.pth",
    ),
}

title: str = "Liver Tumor Segmentation ML Service"
description: str = "Microservice for ML model inference"
version: str = "1.0.0"
