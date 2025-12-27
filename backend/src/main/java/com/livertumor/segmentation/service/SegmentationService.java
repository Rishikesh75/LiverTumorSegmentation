package com.livertumor.segmentation.service;

import com.livertumor.segmentation.model.SegmentationRequest;
import com.livertumor.segmentation.model.SegmentationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Service for handling segmentation requests.
 * Delegates ML inference to the ML microservice via MLServiceClient.
 */
@Service
public class SegmentationService {

    private static final Logger logger = LoggerFactory.getLogger(SegmentationService.class);

    @Autowired
    private MLServiceClient mlServiceClient;

    /**
     * Perform segmentation by delegating to ML microservice.
     *
     * @param request SegmentationRequest containing image path and model type
     * @return SegmentationResponse with results
     */
    public SegmentationResponse performSegmentation(SegmentationRequest request) {
        logger.info("Processing segmentation request for image: {}, model: {}", 
                   request.getImagePath(), request.getModelType());
        
        // Delegate to ML microservice
        SegmentationResponse response = mlServiceClient.performSegmentation(request);
        
        if (response.isSuccess()) {
            logger.info("Segmentation completed successfully");
        } else {
            logger.error("Segmentation failed: {}", response.getMessage());
        }
        
        return response;
    }

    /**
     * Get list of available segmentation models.
     *
     * @return List of model names
     */
    public List<String> getAvailableModels() {
        logger.info("Fetching available models");
        return mlServiceClient.getAvailableModels();
    }

    /**
     * Check if ML service is healthy and available.
     *
     * @return true if ML service is healthy, false otherwise
     */
    public boolean isMLServiceHealthy() {
        return mlServiceClient.healthCheck();
    }
}

