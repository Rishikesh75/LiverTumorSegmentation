package com.livertumor.segmentation.model;

public class SegmentationRequest {
    
    private String modelType;
    private String imagePath;

    public SegmentationRequest() {
    }

    public SegmentationRequest(String modelType, String imagePath) {
        this.modelType = modelType;
        this.imagePath = imagePath;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
}

