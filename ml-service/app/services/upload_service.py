import logging
import shutil
from pathlib import Path

from fastapi import UploadFile

from config.config import UPLOAD_DIR

logger = logging.getLogger(__name__)


class UploadService:
    @staticmethod
    def _is_supported_volume_file(filename: str) -> bool:
        lowered = filename.lower()
        return lowered.endswith(".nii") or lowered.endswith(".nii.gz")

    def validate_image_file(self, filename: str, content_type: str | None = None) -> None:
        if not self._is_supported_volume_file(filename):
            raise ValueError("File must be a NIfTI volume (.nii or .nii.gz)")

    def save_upload(self, file: UploadFile) -> dict:
        self.validate_image_file(file.filename, file.content_type)

        file_path = UPLOAD_DIR / Path(file.filename).name
        file_path.parent.mkdir(parents=True, exist_ok=True)

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"File uploaded: {file_path.name}")

        return {
            "success": True,
            "filename": file_path.name,
            "message": "File uploaded successfully",
        }
