import logging

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from services.volume_management_service import VolumenManagement
from services.image_service import ImageService
logger = logging.getLogger(__name__)

router = APIRouter(tags=["upload"])
volume_management_service = VolumenManagement()
image_service = ImageService()


    

@router.post("/upload/volume")
async def upload_volume(file: UploadFile = File(...)):
    """
    Upload a volume to the ML service.
    Note: In the microservice architecture, files are typically uploaded to the backend,
    but this endpoint is provided for direct testing.
    """
    try:
        return volume_management_service.save_upload(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    

@router.get("/volume/{filename}")
async def get_volume(filename: str):
    """
    Retrieve an uploaded volume by filename.
    """
    try:
        file_path = volume_management_service.resolve_upload_path(filename)
        return FileResponse(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Volume not found")
    except Exception as e:
        logger.error(f"Error retrieving volume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    

