package com.livertumor.segmentation.model;

public class SegmentationResponse {
    
    private String message;
    private String segmentedImagePath;
    private String originalImagePath;
    private boolean success;
    private String modelUsed;

    public SegmentationResponse() {
    }

    public SegmentationResponse(String message, String segmentedImagePath, 
                               String originalImagePath, boolean success, String modelUsed) {
        this.message = message;
        this.segmentedImagePath = segmentedImagePath;
        this.originalImagePath = originalImagePath;
        this.success = success;
        this.modelUsed = modelUsed;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSegmentedImagePath() {
        return segmentedImagePath;
    }

    public void setSegmentedImagePath(String segmentedImagePath) {
        this.segmentedImagePath = segmentedImagePath;
    }

    public String getOriginalImagePath() {
        return originalImagePath;
    }

    public void setOriginalImagePath(String originalImagePath) {
        this.originalImagePath = originalImagePath;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }
}

