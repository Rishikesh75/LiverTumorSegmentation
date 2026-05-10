package com.livertumor.segmentation.job;

import com.livertumor.segmentation.model.SegmentationRequest;
import com.livertumor.segmentation.model.SegmentationResponse;
import com.livertumor.segmentation.persistence.AppUser;
import com.livertumor.segmentation.persistence.AppUserRepository;
import com.livertumor.segmentation.persistence.JobStatus;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.SegmentationJobRepository;
import com.livertumor.segmentation.persistence.VolumeEntity;
import com.livertumor.segmentation.persistence.VolumeRepository;
import com.livertumor.segmentation.service.SegmentationEmailService;
import com.livertumor.segmentation.service.SegmentationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncSegmentationJobProcessor {

    private static final Logger log = LoggerFactory.getLogger(AsyncSegmentationJobProcessor.class);

    private final JobExecutionGate jobExecutionGate;
    private final SegmentationJobRepository jobRepository;
    private final VolumeRepository volumeRepository;
    private final SegmentationService segmentationService;
    private final SegmentationEmailService segmentationEmailService;
    private final AppUserRepository appUserRepository;
    private final WebhookDeliveryService webhookDeliveryService;
    private final SegmentationJobStateService jobStateService;

    public AsyncSegmentationJobProcessor(
            JobExecutionGate jobExecutionGate,
            SegmentationJobRepository jobRepository,
            VolumeRepository volumeRepository,
            SegmentationService segmentationService,
            SegmentationEmailService segmentationEmailService,
            AppUserRepository appUserRepository,
            WebhookDeliveryService webhookDeliveryService,
            SegmentationJobStateService jobStateService) {
        this.jobExecutionGate = jobExecutionGate;
        this.jobRepository = jobRepository;
        this.volumeRepository = volumeRepository;
        this.segmentationService = segmentationService;
        this.segmentationEmailService = segmentationEmailService;
        this.appUserRepository = appUserRepository;
        this.webhookDeliveryService = webhookDeliveryService;
        this.jobStateService = jobStateService;
    }

    @Async
    public void processJobAsync(String jobId) {
        jobExecutionGate.acquire();
        try {
            processJob(jobId);
        } finally {
            jobExecutionGate.release();
        }
    }

    public void processJob(String jobId) {
        SegmentationJobEntity job = jobRepository.findById(jobId).orElse(null);
        if (job == null) {
            log.warn("Job not found for processing: {}", jobId);
            return;
        }
        if (job.getStatus() != JobStatus.queued) {
            log.debug("Skip job {} — status {}", jobId, job.getStatus());
            return;
        }

        VolumeEntity volume = volumeRepository.findById(job.getVolumeId()).orElse(null);
        if (volume == null || volume.getDeletedAt() != null) {
            jobStateService.markFailed(jobId, "Volume missing or deleted");
            return;
        }

        jobStateService.markRunning(jobId);

        SegmentationRequest request = new SegmentationRequest(job.getModelType(), volume.getStoredFileName());
        request.setNotificationEmail(job.getNotificationEmail());
        SegmentationResponse response = segmentationService.performSegmentation(request, false);

        if (response.isSuccess()) {
            jobStateService.markCompleted(jobId, response.getSegmentedImagePath(), response.getMessage());
            SegmentationJobEntity latest = jobRepository.findById(jobId).orElseThrow();
            AppUser owner = appUserRepository.findById(latest.getOwnerId()).orElse(null);
            String fallback = owner != null ? owner.getEmail() : null;
            segmentationEmailService.scheduleAsyncJobCompletion(latest, volume, response, fallback);
            webhookDeliveryService.deliverJobCompleted(latest);
        } else {
            jobStateService.markFailed(jobId, response.getMessage());
        }
    }
}
