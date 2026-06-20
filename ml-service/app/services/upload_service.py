import logging
import shutil

from fastapi import UploadFile

from config.config import UPLOAD_DIR

logger = logging.getLogger(__name__)


class UploadService:
    def validate_image_file(self, content_type: str) -> None:
        if not content_type.startswith("image/"):
            raise ValueError("File must be an image")

    def save_upload(self, file: UploadFile) -> dict:
        self.validate_image_file(file.content_type)

        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"File uploaded: {file.filename}")

        return {
            "success": True,
            "filename": file.filename,
            "message": "File uploaded successfully",
        }
