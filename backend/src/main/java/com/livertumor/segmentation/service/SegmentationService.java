package com.livertumor.segmentation.service;

import com.livertumor.segmentation.model.SegmentationRequest;
import com.livertumor.segmentation.model.SegmentationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class SegmentationService {

    @Autowired
    private FileStorageService fileStorageService;

    public SegmentationResponse performSegmentation(SegmentationRequest request) {
        try {
            String imagePath = request.getImagePath();
            String modelType = request.getModelType();
            
            // Path to the Python script (you'll need to create this)
            Path uploadPath = fileStorageService.getUploadLocation();
            Path fullImagePath = uploadPath.resolve(imagePath);
            
            // This is a placeholder for actual ML model inference
            // In production, you would call your Python ML models here
            String outputImagePath = processWithModel(fullImagePath.toString(), modelType);
            
            return new SegmentationResponse(
                "Segmentation completed successfully",
                outputImagePath,
                imagePath,
                true,
                modelType
            );
        } catch (Exception e) {
            return new SegmentationResponse(
                "Segmentation failed: " + e.getMessage(),
                null,
                request.getImagePath(),
                false,
                request.getModelType()
            );
        }
    }

    private String processWithModel(String imagePath, String modelType) throws Exception {
        // This is where you would integrate with your Python ML models
        // For now, returning a placeholder
        // In production, you would:
        // 1. Call Python script with ProcessBuilder
        // 2. Pass the image path and model type
        // 3. Get the output segmented image path
        
        Path outputPath = fileStorageService.getOutputLocation();
        String outputFileName = "segmented_" + System.currentTimeMillis() + ".png";
        Path outputFullPath = outputPath.resolve(outputFileName);
        
        // Example of calling Python script (you'll need to implement the Python wrapper)
        /*
        List<String> command = new ArrayList<>();
        command.add("python");
        command.add("../ml_inference.py");
        command.add("--input");
        command.add(imagePath);
        command.add("--model");
        command.add(modelType);
        command.add("--output");
        command.add(outputFullPath.toString());
        
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            throw new RuntimeException("Model inference failed");
        }
        */
        
        return outputFileName;
    }

    public List<String> getAvailableModels() {
        List<String> models = new ArrayList<>();
        models.add("unet");
        models.add("unet++");
        models.add("attention");
        models.add("trans-unet");
        models.add("ensemble");
        return models;
    }
}

