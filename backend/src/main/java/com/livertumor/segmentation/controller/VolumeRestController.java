package com.livertumor.segmentation.controller;

import com.livertumor.segmentation.api.ApiMapper;
import com.livertumor.segmentation.config.OpenApiConfig;
import com.livertumor.segmentation.persistence.VolumeFormat;
import com.livertumor.segmentation.service.UserProvisioningService;
import com.livertumor.segmentation.service.VolumeUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/volumes")
@Tag(name = "Volumes", description = "Volumetric uploads")
public class VolumeRestController {

    private final VolumeUploadService volumeUploadService;
    private final UserProvisioningService userProvisioningService;

    public VolumeRestController(
            VolumeUploadService volumeUploadService, UserProvisioningService userProvisioningService) {
        this.volumeUploadService = volumeUploadService;
        this.userProvisioningService = userProvisioningService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload volume", description = "Multipart field `file` or repeated `files`.")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public ResponseEntity<?> upload(
            Authentication authentication,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "format", defaultValue = "nifti") String format) {
        var user = userProvisioningService.ensurePersisted(authentication);
        List<MultipartFile> parts = new ArrayList<>();
        if (file != null && !file.isEmpty()) {
            parts.add(file);
        }
        if (files != null) {
            parts.addAll(files.stream().filter(f -> f != null && !f.isEmpty()).toList());
        }
        VolumeFormat vf;
        try {
            vf = VolumeFormat.valueOf(format.trim().toLowerCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid format: use nifti or dicom");
        }
        try {
            var saved = volumeUploadService.uploadVolume(user.getId(), parts, vf);
            return ResponseEntity.ok(ApiMapper.volume(saved));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}
