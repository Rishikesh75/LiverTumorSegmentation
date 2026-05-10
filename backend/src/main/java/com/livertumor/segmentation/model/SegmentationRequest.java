package com.livertumor.segmentation.model;

public class SegmentationRequest {
    
    private String modelType;
    private String imagePath;

    /**
     * Optional override for the notification recipient. When omitted, the authenticated user's email is used.
     */
    private String notificationEmail;

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

    public String getNotificationEmail() {
        return notificationEmail;
    }

    public void setNotificationEmail(String notificationEmail) {
        this.notificationEmail = notificationEmail;
    }
}

