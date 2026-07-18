import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from schemas.volume_schema import VolumePathResponse, VolumeUploadResponse
from services.volume_management_service import VolumeManagement

logger = logging.getLogger(__name__)

router = APIRouter(tags=["upload"])
volume_management_service = VolumeManagement()


@router.post("/upload/volume", response_model=VolumeUploadResponse)
async def upload_volume(file: UploadFile = File(...)):
    """
    Upload a NIfTI volume to the ML service and return its assigned ID.
    """
    try:
        return volume_management_service.save_upload(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/volume/{volume_id}/path", response_model=VolumePathResponse)
async def get_volume_path(volume_id: str):
    """
    Retrieve the stored path for an uploaded volume by ID.
    """
    try:
        return volume_management_service.get_volume_path(volume_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error retrieving volume path: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segmentation/download/{filename}")
async def download_segmented_file(filename: str):
    """
    Download a segmented NIfTI file from the outputs directory by filename.
    """
    try:
        file_path = volume_management_service.resolve_segmented_path(filename)
        return FileResponse(
            path=file_path,
            media_type="application/octet-stream",
            filename=Path(file_path).name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error downloading segmented file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
