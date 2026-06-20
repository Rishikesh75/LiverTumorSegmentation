import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

from services.upload_service import UploadService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["upload"])
upload_service = UploadService()


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image to the ML service.
    Note: In the microservice architecture, files are typically uploaded to the backend,
    but this endpoint is provided for direct testing.
    """
    try:
        return upload_service.save_upload(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
