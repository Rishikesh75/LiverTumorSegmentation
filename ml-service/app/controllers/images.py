import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from services.image_service import ImageService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["images"])
image_service = ImageService()


@router.get("/images/{filename}")
async def get_image(filename: str, type: str = "output"):
    """
    Retrieve an image (upload or output).

    Args:
        filename: Name of the image file
        type: 'upload' or 'output' (default: output)
    """
    try:
        file_path = image_service.resolve_image_path(filename, type)
        return FileResponse(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        logger.error(f"Error retrieving image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
