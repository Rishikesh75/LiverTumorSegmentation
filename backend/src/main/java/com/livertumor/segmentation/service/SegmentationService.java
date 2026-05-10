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

    @Autowired
    private SegmentationEmailService segmentationEmailService;

    /**
     * Perform segmentation by delegating to ML microservice.
     *
     * @param sendCompletionEmail when true, schedules notification like the legacy synchronous endpoint
     */
    public SegmentationResponse performSegmentation(SegmentationRequest request, boolean sendCompletionEmail) {
        logger.info("Processing segmentation request for image: {}, model: {}",
                request.getImagePath(), request.getModelType());

        SegmentationResponse response = mlServiceClient.performSegmentation(request);

        if (response.isSuccess()) {
            logger.info("Segmentation completed successfully");
            if (sendCompletionEmail) {
                segmentationEmailService.scheduleCompletionNotification(request, response);
            }
        } else {
            logger.error("Segmentation failed: {}", response.getMessage());
        }

        return response;
    }

    /**
     * @deprecated prefer {@link #performSegmentation(SegmentationRequest, boolean)}
     */
    public SegmentationResponse performSegmentation(SegmentationRequest request) {
        return performSegmentation(request, true);
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

