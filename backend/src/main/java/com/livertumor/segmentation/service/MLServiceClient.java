package com.livertumor.segmentation.service;

import com.livertumor.segmentation.model.SegmentationRequest;
import com.livertumor.segmentation.model.SegmentationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Client service for communicating with the Python ML microservice.
 * Handles all HTTP communication with the ML inference service.
 */
@Service
public class MLServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(MLServiceClient.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ml.service.url:http://localhost:5000}")
    private String mlServiceUrl;

    /**
     * Perform segmentation by calling the ML microservice.
     *
     * @param request SegmentationRequest containing image path and model type
     * @return SegmentationResponse with results
     */
    public SegmentationResponse performSegmentation(SegmentationRequest request) {
        try {
            logger.info("Calling ML service for segmentation: {}, model: {}", 
                       request.getImagePath(), request.getModelType());
            
            String url = mlServiceUrl + "/segment";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("image_path", request.getImagePath());
            requestBody.put("model_type", request.getModelType());
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                logger.info("ML service segmentation completed successfully");
                
                return new SegmentationResponse(
                    (String) body.get("message"),
                    (String) body.get("output_path"),
                    request.getImagePath(),
                    (Boolean) body.get("success"),
                    (String) body.get("model_used")
                );
            } else {
                logger.error("ML Service returned error: {}", response.getStatusCode());
                throw new RuntimeException("ML Service returned error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Segmentation failed: {}", e.getMessage(), e);
            return new SegmentationResponse(
                "Segmentation failed: " + e.getMessage(),
                null,
                request.getImagePath(),
                false,
                request.getModelType()
            );
        }
    }

    /**
     * Get list of available models from ML service.
     *
     * @return List of available model names
     */
    public List<String> getAvailableModels() {
        try {
            logger.info("Fetching available models from ML service");
            
            String url = mlServiceUrl + "/models";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<String> models = (List<String>) response.getBody().get("models");
                logger.info("Available models: {}", models);
                return models;
            }
        } catch (Exception e) {
            logger.error("Failed to fetch models from ML service: {}", e.getMessage());
        }
        
        // Fallback to default models if ML service is unavailable
        logger.warn("Using fallback model list");
        return Arrays.asList("unet", "unet++", "attention", "trans-unet", "ensemble");
    }

    /**
     * Check if ML service is healthy and available.
     *
     * @return true if ML service is healthy, false otherwise
     */
    public boolean healthCheck() {
        try {
            String url = mlServiceUrl + "/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            boolean isHealthy = response.getStatusCode() == HttpStatus.OK;
            logger.info("ML service health check: {}", isHealthy ? "healthy" : "unhealthy");
            
            return isHealthy;
        } catch (Exception e) {
            logger.error("ML service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get ML service information.
     *
     * @return Map containing service information
     */
    public Map<String, Object> getServiceInfo() {
        try {
            String url = mlServiceUrl + "/";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (Exception e) {
            logger.error("Failed to get ML service info: {}", e.getMessage());
        }
        
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("status", "unavailable");
        fallback.put("message", "ML service is not reachable");
        return fallback;
    }
}

