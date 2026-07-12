import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from schemas.segmentation_request_schema import SegmentationRequest
from services.segmentation_service import SegmentationService
from services.model_service import ModelService
logger = logging.getLogger(__name__)

router = APIRouter(tags=["segmentation"])
segmentation_service = SegmentationService()
model_service = ModelService()  # Access the model service for listing available models

@router.post("/segment")
async def segment_image(request: SegmentationRequest):
    """
    Perform segmentation on the uploaded volume and return the generated .nii.gz file.
    """
    try:
        output_path = segmentation_service.segment(
            request.image_path,
            request.model_type,
        )
        return FileResponse(
            path=output_path,
            media_type="application/octet-stream",
            filename=Path(output_path).name,
        )
    except FileNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Segmentation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")


@router.post("/segment/resunet")
async def segment_resunet(request: SegmentationRequest):
    try:
        output_path = segmentation_service.segment(request.image_path, "resunet")
        return FileResponse(
            path=output_path,
            media_type="application/octet-stream",
            filename=Path(output_path).name,
        )
    except FileNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Segmentation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")
    

@router.get("/segmentation/models")
async def get_available_models():
    """Get list of available segmentation models."""
    return {"models": model_service.list_available_models()}

