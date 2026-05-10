package com.livertumor.segmentation.controller;

import com.livertumor.segmentation.api.ApiMapper;
import com.livertumor.segmentation.api.dto.ApiDtos;
import com.livertumor.segmentation.config.AppProperties;
import com.livertumor.segmentation.config.OpenApiConfig;
import com.livertumor.segmentation.job.SegmentationJobCommandService;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.SegmentationJobRepository;
import com.livertumor.segmentation.persistence.VolumeEntity;
import com.livertumor.segmentation.persistence.VolumeRepository;
import com.livertumor.segmentation.service.SegmentationEmailService;
import com.livertumor.segmentation.service.UserProvisioningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Jobs", description = "Async volumetric segmentation jobs")
public class JobRestController {

    private final SegmentationJobCommandService jobCommandService;
    private final SegmentationJobRepository jobRepository;
    private final VolumeRepository volumeRepository;
    private final UserProvisioningService userProvisioningService;
    private final AppProperties appProperties;
    private final SegmentationEmailService segmentationEmailService;

    public JobRestController(
            SegmentationJobCommandService jobCommandService,
            SegmentationJobRepository jobRepository,
            VolumeRepository volumeRepository,
            UserProvisioningService userProvisioningService,
            AppProperties appProperties,
            SegmentationEmailService segmentationEmailService) {
        this.jobCommandService = jobCommandService;
        this.jobRepository = jobRepository;
        this.volumeRepository = volumeRepository;
        this.userProvisioningService = userProvisioningService;
        this.appProperties = appProperties;
        this.segmentationEmailService = segmentationEmailService;
    }

    @PostMapping
    @Operation(summary = "Create segmentation job")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public ResponseEntity<ApiDtos.JobResponse> createJob(
            Authentication authentication,
            @Valid @RequestBody ApiDtos.CreateJobRequest body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        var user = userProvisioningService.ensurePersisted(authentication);
        SegmentationJobEntity job = jobCommandService.enqueueJob(
                user.getId(),
                body.volumeId(),
                body.modelType(),
                body.volumeDisplayName(),
                body.notificationEmail(),
                Optional.ofNullable(idempotencyKey).filter(StringUtils::hasText));
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiMapper.job(job, appProperties));
    }

    @GetMapping
    @Operation(summary = "List jobs for current user")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public List<ApiDtos.JobResponse> listJobs(Authentication authentication) {
        var user = userProvisioningService.ensurePersisted(authentication);
        return jobRepository.findByOwnerIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(j -> ApiMapper.job(j, appProperties))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Job detail")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public ResponseEntity<ApiDtos.JobResponse> getJob(Authentication authentication, @PathVariable String id) {
        var user = userProvisioningService.ensurePersisted(authentication);
        return jobRepository
                .findByIdAndOwnerId(id, user.getId())
                .map(j -> ResponseEntity.ok(ApiMapper.job(j, appProperties)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/results")
    @Operation(summary = "Job results URLs")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public ResponseEntity<ApiDtos.JobResultsResponse> results(Authentication authentication, @PathVariable String id) {
        var user = userProvisioningService.ensurePersisted(authentication);
        return jobRepository
                .findByIdAndOwnerId(id, user.getId())
                .map(j -> ResponseEntity.ok(ApiMapper.results(j, appProperties)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/notify")
    @Operation(summary = "Resend completion email for a finished job")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public ResponseEntity<Void> notify(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody(required = false) ApiDtos.NotifyJobRequest body) {
        var user = userProvisioningService.ensurePersisted(authentication);
        SegmentationJobEntity job =
                jobRepository.findByIdAndOwnerId(id, user.getId()).orElse(null);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        VolumeEntity volume = volumeRepository.findById(job.getVolumeId()).orElse(null);
        if (volume == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            String override = body != null ? body.email() : null;
            segmentationEmailService.sendManualJobNotification(job, volume, override);
            return ResponseEntity.accepted().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
