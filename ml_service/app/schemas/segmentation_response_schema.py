from pydantic import BaseModel
class SegmentationResponse(BaseModel):
    success: bool
    message: str
    output_path: str = None
    model_used: str
