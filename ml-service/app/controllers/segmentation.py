import logging

from fastapi import APIRouter, HTTPException

from schemas.segmentation_request_schema import SegmentationRequest
from schemas.segmentation_response_schema import SegmentationResponse
from services.segmentation_service import SegmentationService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["segmentation"])
segmentation_service = SegmentationService()


@router.post("/segment", response_model=SegmentationResponse)
async def segment_image(request: SegmentationRequest):
    """
    Perform segmentation on the uploaded image.

    Args:
        request: SegmentationRequest with image_path and model_type

    Returns:
        SegmentationResponse with results
    """
    try:
        return segmentation_service.segment(request.image_path, request.model_type)
    except FileNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Segmentation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")
