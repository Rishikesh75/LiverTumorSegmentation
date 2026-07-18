from pydantic import BaseModel
class SegmentationRequest(BaseModel):
    image_path: str
    model_type: str

