#!/usr/bin/env python3
"""
FastAPI-based ML Inference Service for Liver Tumor Segmentation
This service provides RESTful APIs for model inference using multiple segmentation models.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os
import shutil
from pathlib import Path
import numpy as np
from PIL import Image
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Liver Tumor Segmentation ML Service",
    description="Microservice for ML model inference",
    version="1.0.0"
)

# Configuration
UPLOAD_DIR = Path("../backend/uploads")
OUTPUT_DIR = Path("../backend/outputs")
MODELS_DIR = Path("models")

# Create directories if they don't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Request/Response Models
class SegmentationRequest(BaseModel):
    image_path: str
    model_type: str

class SegmentationResponse(BaseModel):
    success: bool
    message: str
    output_path: str = None
    model_used: str

# Model loading functions
# TODO: Implement actual model loading based on your trained models
def load_model(model_type: str):
    """
    Load the specified model.
    Replace this with your actual model loading logic.
    """
    logger.info(f"Loading {model_type} model...")
    
    # Example model paths (update with your actual model files)
    model_paths = {
        'unet': MODELS_DIR / 'unet_model.h5',
        'unet++': MODELS_DIR / 'unet_plus_plus_model.h5',
        'attention': MODELS_DIR / 'attention_model.h5',
        'trans-unet': MODELS_DIR / 'trans_unet_model.h5',
        'ensemble': MODELS_DIR / 'ensemble_weights.pkl'
    }
    
    # TODO: Load actual model
    # Example for TensorFlow/Keras:
    # if model_type in model_paths and model_paths[model_type].exists():
    #     from tensorflow import keras
    #     model = keras.models.load_model(str(model_paths[model_type]))
    #     return model
    
    # For now, return None (placeholder)
    logger.warning(f"Model loading not implemented yet for {model_type}")
    return None

def preprocess_image(image_path: Path):
    """
    Preprocess the input image for model inference.
    Adapt this based on your model's requirements.
    """
    logger.info(f"Preprocessing image: {image_path}")
    
    # Load image
    img = Image.open(image_path)
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # TODO: Add your specific preprocessing steps
    # Example: resize, normalize, etc.
    img = img.resize((256, 256))
    img_array = np.array(img)
    
    # TODO: Normalize based on your training
    # img_array = img_array / 255.0
    
    return img_array

def perform_inference(model, image):
    """
    Perform model inference.
    Replace with your actual inference logic.
    """
    logger.info("Performing inference...")
    
    # TODO: Implement actual inference
    # Example:
    # prediction = model.predict(np.expand_dims(image, axis=0))
    # return prediction[0]
    
    # Placeholder: return the input image
    return image

def postprocess_result(prediction):
    """
    Postprocess the model output.
    Adapt based on your model's output format.
    """
    logger.info("Postprocessing result...")
    
    # TODO: Add your postprocessing steps
    # Example: threshold, convert to binary mask, colorize, etc.
    
    # Ensure the result is in uint8 format for image saving
    if prediction.dtype != np.uint8:
        # Normalize to 0-255 range if needed
        if prediction.max() <= 1.0:
            prediction = (prediction * 255).astype(np.uint8)
        else:
            prediction = prediction.astype(np.uint8)
    
    return prediction

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Liver Tumor Segmentation ML Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring."""
    return {
        "status": "healthy",
        "service": "ML Inference Service"
    }

@app.get("/models")
async def get_available_models():
    """Get list of available segmentation models."""
    return {
        "models": [
            "unet",
            "unet++",
            "attention",
            "trans-unet",
            "ensemble"
        ]
    }

@app.post("/segment", response_model=SegmentationResponse)
async def segment_image(request: SegmentationRequest):
    """
    Perform segmentation on the uploaded image.
    
    Args:
        request: SegmentationRequest with image_path and model_type
    
    Returns:
        SegmentationResponse with results
    """
    try:
        logger.info(f"Received segmentation request: {request.image_path}, model: {request.model_type}")
        
        # Validate input
        input_path = UPLOAD_DIR / request.image_path
        if not input_path.exists():
            logger.error(f"Image not found: {input_path}")
            raise HTTPException(
                status_code=404, 
                detail=f"Image not found: {request.image_path}"
            )
        
        # Validate model type
        valid_models = ["unet", "unet++", "attention", "trans-unet", "ensemble"]
        if request.model_type not in valid_models:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model type. Must be one of: {valid_models}"
            )
        
        # Load model
        model = load_model(request.model_type)
        
        # Preprocess
        image = preprocess_image(input_path)
        
        # Inference
        prediction = perform_inference(model, image)
        
        # Postprocess
        result = postprocess_result(prediction)
        
        # Save output
        output_filename = f"segmented_{request.model_type}_{Path(request.image_path).stem}_{os.urandom(4).hex()}.png"
        output_path = OUTPUT_DIR / output_filename
        
        # Convert to PIL Image and save
        result_img = Image.fromarray(result)
        result_img.save(output_path)
        
        logger.info(f"Segmentation completed successfully: {output_filename}")
        
        return SegmentationResponse(
            success=True,
            message="Segmentation completed successfully",
            output_path=output_filename,
            model_used=request.model_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Segmentation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Segmentation failed: {str(e)}"
        )

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image to the ML service.
    Note: In the microservice architecture, files are typically uploaded to the backend,
    but this endpoint is provided for direct testing.
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File uploaded: {file.filename}")
        
        return {
            "success": True,
            "filename": file.filename,
            "message": "File uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Upload failed: {str(e)}"
        )

@app.get("/images/{filename}")
async def get_image(filename: str, type: str = "output"):
    """
    Retrieve an image (upload or output).
    
    Args:
        filename: Name of the image file
        type: 'upload' or 'output' (default: output)
    """
    try:
        if type == "upload":
            file_path = UPLOAD_DIR / filename
        else:
            file_path = OUTPUT_DIR / filename
            
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Image not found")
            
        return FileResponse(file_path)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Main entry point
if __name__ == "__main__":
    logger.info("Starting Liver Tumor Segmentation ML Service...")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=5000,
        log_level="info"
    )

