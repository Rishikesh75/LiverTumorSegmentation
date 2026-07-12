import json
import logging
import shutil
import nibabel as nib
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
import numpy as np

from fastapi import UploadFile

from config.config import OUTPUT_DIR, UPLOAD_DIR
from schemas.volume_schema import VolumePathResponse, VolumeUploadResponse

logger = logging.getLogger(__name__)

REGISTRY_FILENAME = "volumes.json"


class VolumeManagement:
    @staticmethod
    def _is_supported_volume_file(filename: str) -> bool:
        lowered = filename.lower()
        return lowered.endswith(".nii") or lowered.endswith(".nii.gz")

    @staticmethod
    def _get_extension(filename: str) -> str:
        lowered = filename.lower()
        if lowered.endswith(".nii.gz"):
            return ".nii.gz"
        if lowered.endswith(".nii"):
            return ".nii"
        raise ValueError("File must be a NIfTI volume (.nii or .nii.gz)")

    @staticmethod
    def _registry_path() -> Path:
        return UPLOAD_DIR / REGISTRY_FILENAME

    def _load_registry(self) -> dict:
        registry_path = self._registry_path()
        if not registry_path.exists():
            return {}

        with registry_path.open("r", encoding="utf-8") as registry_file:
            return json.load(registry_file)

    def _save_registry(self, registry: dict) -> None:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        registry_path = self._registry_path()
        with registry_path.open("w", encoding="utf-8") as registry_file:
            json.dump(registry, registry_file, indent=2)

    def validate_image_file(self, filename: str, content_type: str | None = None) -> None:
        if not filename:
            raise ValueError("Uploaded file must include a filename")
        if not self._is_supported_volume_file(filename):
            raise ValueError("File must be a NIfTI volume (.nii or .nii.gz)")

    def save_upload(self, file: UploadFile) -> VolumeUploadResponse:
        original_filename = Path(file.filename or "").name
        self.validate_image_file(original_filename, file.content_type)

        volume_id = str(uuid4())
        extension = self._get_extension(original_filename)
        stored_filename = f"{volume_id}{extension}"
        file_path = UPLOAD_DIR / stored_filename
        file_path.parent.mkdir(parents=True, exist_ok=True)

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        registry = self._load_registry()
        registry[volume_id] = {
            "filename": stored_filename,
            "original_filename": original_filename,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._save_registry(registry)

        logger.info("File uploaded: %s (id=%s)", stored_filename, volume_id)

        return VolumeUploadResponse(
            id=volume_id,
            filename=stored_filename,
            path=stored_filename,
            original_filename=original_filename,
            message="File uploaded successfully",
        )

    def get_volume_path(self, volume_id: str) -> VolumePathResponse:
        if "/" in volume_id or "\\" in volume_id:
            raise ValueError("Invalid volume ID")

        registry = self._load_registry()
        entry = registry.get(volume_id)
        if not entry:
            raise FileNotFoundError(f"Volume not found: {volume_id}")

        filename = Path(entry["filename"]).name
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise FileNotFoundError(f"Volume file not found: {volume_id}")

        return VolumePathResponse(
            id=volume_id,
            filename=filename,
            path=filename,
            absolute_path=str(file_path.resolve()),
        )

    def resolve_segmented_path(self, filename: str) -> Path:
        safe_filename = Path(filename).name
        if not safe_filename:
            raise ValueError("Invalid filename")

        file_path = OUTPUT_DIR / safe_filename
        if not file_path.exists():
            raise FileNotFoundError(f"Segmented file not found: {safe_filename}")

        return file_path
    
    def get_volume_input_path(self, volume_path: str) -> Path:
        input_path = UPLOAD_DIR / volume_path
        if not input_path.exists():
            raise FileNotFoundError(f"Volume not found: {volume_path}")
        return input_path

    def load_volume(self, volume_path: Path):
        logger.info(f"Loading volume: {volume_path}")
        # Disable memmap on Windows to avoid mmap allocation failures (WinError 8).
        image = nib.load(str(volume_path), mmap=False)
        try:
            volume = image.get_fdata(dtype=np.float32)
        except OSError as exc:
            logger.warning(
                "get_fdata failed (%s). Falling back to array proxy loading.",
                exc,
            )
            # Fallback path for environments where a single allocation can fail.
            volume = np.asarray(image.dataobj, dtype=np.float32)
        return image, volume
