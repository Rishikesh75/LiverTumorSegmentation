package com.livertumor.segmentation.service;

import com.livertumor.segmentation.persistence.SegmentationJobRepository;
import com.livertumor.segmentation.persistence.JobEventRepository;
import com.livertumor.segmentation.persistence.IdempotencyKeyRepository;
import com.livertumor.segmentation.persistence.VolumeRepository;
import com.livertumor.segmentation.service.storage.ObjectStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VolumePurgeService {

    private final VolumeRepository volumeRepository;
    private final SegmentationJobRepository jobRepository;
    private final JobEventRepository jobEventRepository;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final ObjectStorageService objectStorageService;

    public VolumePurgeService(
            VolumeRepository volumeRepository,
            SegmentationJobRepository jobRepository,
            JobEventRepository jobEventRepository,
            IdempotencyKeyRepository idempotencyKeyRepository,
            ObjectStorageService objectStorageService) {
        this.volumeRepository = volumeRepository;
        this.jobRepository = jobRepository;
        this.jobEventRepository = jobEventRepository;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.objectStorageService = objectStorageService;
    }

    @Transactional
    public void purgeVolume(String volumeId) {
        jobRepository.findByVolumeId(volumeId).forEach(job -> {
            jobEventRepository.deleteByJobId(job.getId());
            idempotencyKeyRepository.deleteByJobId(job.getId());
            objectStorageService.deleteOutput(job.getOutputFileName());
            jobRepository.deleteById(job.getId());
        });
        volumeRepository.findById(volumeId).ifPresent(v -> {
            objectStorageService.deleteUpload(v.getStoredFileName());
            volumeRepository.delete(v);
        });
    }
}
