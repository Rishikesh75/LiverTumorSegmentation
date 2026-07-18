import logging

from services.model_service import ModelService
from services.volume_management_service import VolumeManagement
logger = logging.getLogger(__name__)


class SegmentationService:
    def __init__(self):
        self.model_service = ModelService()
        self.volume_management_service = VolumeManagement()

    def segment(self, image_path: str, model_type: str) -> str:
        logger.info(f"Received segmentation request: {image_path}, model: {model_type}")

        self.model_service.validate_model_type(model_type)
        input_path = self.volume_management_service.get_volume_input_path(image_path)

        model = self.model_service.load_model(model_type)
        original_image, volume = self.volume_management_service.load_volume(input_path)
        preprocessed_volume = self.model_service.preprocess(volume)
        prediction = self.model_service.infer(model, preprocessed_volume)
        result = self.model_service.postprocess(prediction, original_shape=volume.shape)
        output_path = self.model_service.save_segmentation_result(
            result=result,
            model_type=model_type,
            source_path=input_path,
            original_image=original_image,
        )

        logger.info(f"Segmentation completed successfully: {output_path}")
        return output_path
