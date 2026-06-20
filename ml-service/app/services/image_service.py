import logging
import os
from pathlib import Path

import numpy as np
from PIL import Image

from config.config import OUTPUT_DIR, UPLOAD_DIR

logger = logging.getLogger(__name__)


class ImageService:
    def get_input_path(self, image_path: str) -> Path:
        input_path = UPLOAD_DIR / image_path
        if not input_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")
        return input_path

    def preprocess(self, image_path: Path) -> np.ndarray:
        """
        Preprocess the input image for model inference.
        Adapt this based on your model's requirements.
        """
        logger.info(f"Preprocessing image: {image_path}")

        img = Image.open(image_path)

        if img.mode != "RGB":
            img = img.convert("RGB")

        # TODO: Add your specific preprocessing steps
        img = img.resize((256, 256))
        img_array = np.array(img)

        # TODO: Normalize based on your training
        # img_array = img_array / 255.0

        return img_array

    def postprocess(self, prediction) -> np.ndarray:
        """
        Postprocess the model output.
        Adapt based on your model's output format.
        """
        logger.info("Postprocessing result...")

        # TODO: Add your postprocessing steps

        if prediction.dtype != np.uint8:
            if prediction.max() <= 1.0:
                prediction = (prediction * 255).astype(np.uint8)
            else:
                prediction = prediction.astype(np.uint8)

        return prediction

    def save_segmentation_result(
        self, result: np.ndarray, model_type: str, source_filename: str
    ) -> str:
        output_filename = (
            f"segmented_{model_type}_{Path(source_filename).stem}_{os.urandom(4).hex()}.png"
        )
        output_path = OUTPUT_DIR / output_filename

        result_img = Image.fromarray(result)
        result_img.save(output_path)

        logger.info(f"Segmentation result saved: {output_filename}")
        return output_filename

    def resolve_image_path(self, filename: str, image_type: str) -> Path:
        if image_type == "upload":
            file_path = UPLOAD_DIR / filename
        else:
            file_path = OUTPUT_DIR / filename

        if not file_path.exists():
            raise FileNotFoundError("Image not found")

        return file_path
