package com.livertumor.segmentation.controller;

import com.livertumor.segmentation.config.OpenApiConfig;
import com.livertumor.segmentation.model.SegmentationRequest;
import com.livertumor.segmentation.model.SegmentationResponse;
import com.livertumor.segmentation.service.FileStorageService;
import com.livertumor.segmentation.service.SegmentationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Segmentation", description = "Health, models, upload, and inference")
public class SegmentationController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SegmentationService segmentationService;

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Public liveness endpoint.")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Service is up"))
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Liver Tumor Segmentation API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/models")
    @Operation(summary = "List segmentation models")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Model identifiers"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<List<String>> getAvailableModels() {
        return ResponseEntity.ok(segmentationService.getAvailableModels());
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload image", description = "Multipart form field `file`.")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stored file name"),
            @ApiResponse(responseCode = "400", description = "Upload failed"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
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
    @Operation(summary = "Run segmentation", description = "JSON body with modelType and imagePath. Optional notificationEmail overrides the completion email recipient.")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Segmentation result"),
            @ApiResponse(responseCode = "400", description = "Request or inference failed"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<SegmentationResponse> performSegmentation(@RequestBody SegmentationRequest request) {
        SegmentationResponse response = segmentationService.performSegmentation(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/images/{fileName:.+}")
    @Operation(summary = "Get image", description = "Query param `type`: upload or output.")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PNG image bytes"),
            @ApiResponse(responseCode = "400", description = "Invalid path"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "File not found")
    })
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

