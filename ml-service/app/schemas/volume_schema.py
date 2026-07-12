from pydantic import BaseModel


class VolumeUploadResponse(BaseModel):
    id: str
    filename: str
    path: str
    original_filename: str
    message: str


class VolumePathResponse(BaseModel):
    id: str
    filename: str
    path: str
    absolute_path: str
