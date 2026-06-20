import logging

from schemas.segmentation_response_schema import SegmentationResponse
from services.image_service import ImageService
from services.model_service import ModelService

logger = logging.getLogger(__name__)


class SegmentationService:
    def __init__(self):
        self.model_service = ModelService()
        self.image_service = ImageService()

    def segment(self, image_path: str, model_type: str) -> SegmentationResponse:
        logger.info(f"Received segmentation request: {image_path}, model: {model_type}")

        self.model_service.validate_model_type(model_type)
        input_path = self.image_service.get_input_path(image_path)

        model = self.model_service.load_model(model_type)
        image = self.image_service.preprocess(input_path)
        prediction = self.model_service.infer(model, image)
        result = self.image_service.postprocess(prediction)
        output_filename = self.image_service.save_segmentation_result(
            result, model_type, image_path
        )

        logger.info(f"Segmentation completed successfully: {output_filename}")

        return SegmentationResponse(
            success=True,
            message="Segmentation completed successfully",
            output_path=output_filename,
            model_used=model_type,
        )
