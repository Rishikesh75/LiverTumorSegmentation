import logging

import numpy as np

from config.config import DEFAULT_MODEL
from services.model_service import model_service
from services.volume_management_service import VolumeManagement

logger = logging.getLogger(__name__)


class SegmentationService:
    def __init__(self):
        self.model_service = model_service
        self.volume_management_service = VolumeManagement()

    def segment(self, image_path: str, model_type: str | None = None) -> str:
        model_type = model_type or DEFAULT_MODEL
        logger.info("Received segmentation request: %s, model: %s", image_path, model_type)

        self.model_service.validate_model_type(model_type)
        input_path = self.volume_management_service.get_volume_input_path(image_path)

        model = self.model_service.get_model()
        original_image, volume = self.volume_management_service.load_volume(input_path)
        volume = np.squeeze(np.asarray(volume, dtype=np.float32))
        if volume.ndim != 3:
            raise ValueError(f"Expected a 3D volume, got shape {volume.shape}")

        preprocessed_volume = self.model_service.preprocess(volume)
        prediction = self.model_service.infer(model, preprocessed_volume)
        result = self.model_service.postprocess(prediction, original_shape=volume.shape)
        output_path = self.model_service.save_segmentation_result(
            result=result,
            model_type=model_type,
            source_path=input_path,
            original_image=original_image,
        )

        logger.info("Segmentation completed successfully: %s", output_path)
        return output_path
