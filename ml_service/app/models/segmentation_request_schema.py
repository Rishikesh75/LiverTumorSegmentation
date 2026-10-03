from pydantic import BaseModel, Field

from config.config import DEFAULT_MODEL


class SegmentationRequest(BaseModel):
    image_path: str
    model_type: str = Field(default=DEFAULT_MODEL)
