package com.livertumor.segmentation.controller;

import com.livertumor.segmentation.model.SegmentationRequest;
import com.livertumor.segmentation.model.SegmentationResponse;
import com.livertumor.segmentation.service.FileStorageService;
import com.livertumor.segmentation.service.SegmentationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SegmentationController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SegmentationService segmentationService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Liver Tumor Segmentation API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/models")
    public ResponseEntity<List<String>> getAvailableModels() {
        return ResponseEntity.ok(segmentationService.getAvailableModels());
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("message", "File uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/segment")
    public ResponseEntity<SegmentationResponse> performSegmentation(@RequestBody SegmentationRequest request) {
        SegmentationResponse response = segmentationService.performSegmentation(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName, @RequestParam String type) {
        try {
            Path filePath;
            if ("upload".equals(type)) {
                filePath = fileStorageService.getUploadLocation().resolve(fileName).normalize();
            } else {
                filePath = fileStorageService.getOutputLocation().resolve(fileName).normalize();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

