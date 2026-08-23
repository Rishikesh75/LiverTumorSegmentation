import gc
import logging
import os
from pathlib import Path

import nibabel as nib
import numpy as np
import torch
from skimage.transform import resize

from config.config import (
    DEFAULT_MODEL,
    IMG_SIZE,
    INFERENCE_BATCH_SIZE,
    MODELS_DIR,
    MODEL_FILENAME,
    OUTPUT_DIR,
    VALID_MODELS,
)
from ml_models.models.AttentionUNet import AttentionUNet

logger = logging.getLogger(__name__)


class ModelService:
    def __init__(self):
        self._model = None
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    @property
    def device(self) -> torch.device:
        return self._device

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def validate_model_type(self, model_type: str) -> None:
        if model_type not in VALID_MODELS:
            raise ValueError(f"Invalid model type. Must be one of: {VALID_MODELS}")

    def list_available_models(self) -> list[str]:
        return list(VALID_MODELS)

    def get_model(self):
        if self._model is None:
            self._model = self.load_model()
        return self._model

    def load_model(self, model_type: str = DEFAULT_MODEL):
        self.validate_model_type(model_type)
        model_path = MODELS_DIR / MODEL_FILENAME
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        logger.info("Loading %s from %s on %s", model_type, model_path, self._device)
        model = AttentionUNet(in_channels=1, out_channels=3)
        checkpoint = torch.load(model_path, map_location=self._device, weights_only=True)

        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]
        else:
            state_dict = checkpoint

        model.load_state_dict(state_dict)
        model.to(self._device)
        model.eval()
        logger.info("PyTorch model loaded successfully")
        return model

    def preprocess(self, volume: np.ndarray) -> np.ndarray:
        logger.info("Preprocessing volume")
        volume = np.squeeze(np.asarray(volume, dtype=np.float32))
        if volume.ndim != 3:
            raise ValueError(f"Expected a 3D volume, got shape {volume.shape}")

        vmin = float(volume.min())
        vmax = float(volume.max())
        volume = (volume - vmin) / (vmax - vmin + 1e-6)

        slices = [
            resize(
                slc,
                IMG_SIZE,
                mode="constant",
                preserve_range=True,
                anti_aliasing=True,
            )
            for slc in volume.transpose(2, 0, 1)
        ]
        stacked = np.stack(slices, axis=0).astype(np.float32)
        return stacked.transpose(1, 2, 0)

    def infer(self, model, image: np.ndarray) -> np.ndarray:
        logger.info("Performing inference...")
        if image.ndim != 3:
            raise ValueError(f"Expected preprocessed volume (H, W, D), got {image.shape}")

        height, width, depth = image.shape
        labels = np.empty((height, width, depth), dtype=np.uint8)

        with torch.no_grad():
            for start in range(0, depth, INFERENCE_BATCH_SIZE):
                end = min(start + INFERENCE_BATCH_SIZE, depth)
                batch = np.transpose(image[:, :, start:end], (2, 0, 1))
                tensor = torch.from_numpy(batch).unsqueeze(1).to(self._device)
                logits = model(tensor)
                pred = torch.argmax(logits, dim=1).cpu().numpy().astype(np.uint8)
                labels[:, :, start:end] = np.transpose(pred, (1, 2, 0))

        return labels

    def postprocess(self, prediction: np.ndarray, original_shape: tuple[int, ...]) -> np.ndarray:
        logger.info("Postprocessing result...")
        prediction = np.squeeze(np.asarray(prediction))
        original_shape = tuple(int(size) for size in original_shape[:3])

        if prediction.shape == original_shape:
            return prediction.astype(np.uint8)

        if prediction.ndim != 3:
            raise ValueError(f"Expected 3D prediction, got shape {prediction.shape}")

        original_h, original_w, original_d = original_shape
        if prediction.shape[2] != original_d:
            raise ValueError(
                "Prediction depth does not match original depth: "
                f"{prediction.shape[2]} != {original_d}"
            )

        resized_prediction = np.empty(original_shape, dtype=np.uint8)
        for idx in range(original_d):
            resized_prediction[:, :, idx] = resize(
                prediction[:, :, idx],
                (original_h, original_w),
                order=0,
                mode="edge",
                anti_aliasing=False,
                preserve_range=True,
            ).astype(np.uint8)

        return resized_prediction

    def save_segmentation_result(
        self,
        result: np.ndarray,
        model_type: str,
        source_path: Path,
        original_image: nib.Nifti1Image,
    ) -> str:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_filename = (
            f"segmented_{model_type}_{Path(source_path).stem}_{os.urandom(4).hex()}.nii.gz"
        )
        output_path = OUTPUT_DIR / output_filename

        output_image = nib.Nifti1Image(
            np.asarray(result, dtype=np.uint8),
            affine=original_image.affine,
            header=original_image.header,
        )
        nib.save(output_image, str(output_path))
        del output_image
        gc.collect()

        logger.info("Segmentation result saved: %s", output_filename)
        return str(output_path)


model_service = ModelService()
