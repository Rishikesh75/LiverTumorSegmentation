package com.livertumor.segmentation.job;

import com.livertumor.segmentation.config.MlServiceProperties;
import com.livertumor.segmentation.persistence.IdempotencyKeyEntity;
import com.livertumor.segmentation.persistence.IdempotencyKeyRepository;
import com.livertumor.segmentation.persistence.JobEventEntity;
import com.livertumor.segmentation.persistence.JobEventRepository;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.SegmentationJobRepository;
import com.livertumor.segmentation.persistence.VolumeEntity;
import com.livertumor.segmentation.persistence.VolumeRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
public class SegmentationJobCommandService {

    private final SegmentationJobRepository jobRepository;
    private final VolumeRepository volumeRepository;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final JobEventRepository jobEventRepository;
    private final MlServiceProperties mlServiceProperties;
    private final ApplicationEventPublisher eventPublisher;

    public SegmentationJobCommandService(
            SegmentationJobRepository jobRepository,
            VolumeRepository volumeRepository,
            IdempotencyKeyRepository idempotencyKeyRepository,
            JobEventRepository jobEventRepository,
            MlServiceProperties mlServiceProperties,
            ApplicationEventPublisher eventPublisher) {
        this.jobRepository = jobRepository;
        this.volumeRepository = volumeRepository;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.jobEventRepository = jobEventRepository;
        this.mlServiceProperties = mlServiceProperties;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public SegmentationJobEntity enqueueJob(
            String ownerId,
            String volumeId,
            String modelType,
            String volumeDisplayName,
            String notificationEmail,
            Optional<String> idempotencyKey) {
        VolumeEntity volume =
                volumeRepository.findByIdAndOwnerIdAndDeletedAtIsNull(volumeId, ownerId).orElseThrow();

        if (idempotencyKey.filter(StringUtils::hasText).isPresent()) {
            String key = idempotencyKey.get().trim();
            Optional<IdempotencyKeyEntity> existing =
                    idempotencyKeyRepository.findByOwnerIdAndIdempotencyKey(ownerId, key);
            if (existing.isPresent()) {
                return jobRepository.findById(existing.get().getJobId()).orElseThrow();
            }
        }

        String display = StringUtils.hasText(volumeDisplayName) ? volumeDisplayName : volume.getDisplayName();
        SegmentationJobEntity job = SegmentationJobEntity.queued(
                ownerId,
                volume.getId(),
                display,
                modelType,
                mlServiceProperties.getModelVersion(),
                notificationEmail,
                idempotencyKey.map(String::trim).filter(StringUtils::hasText).orElse(null));
        SegmentationJobEntity saved = jobRepository.save(job);
        jobEventRepository.save(JobEventEntity.of(saved.getId(), "queued", null));

        idempotencyKey.filter(StringUtils::hasText).ifPresent(
                key -> idempotencyKeyRepository.save(new IdempotencyKeyEntity(ownerId, key.trim(), saved.getId())));

        eventPublisher.publishEvent(new JobQueuedEvent(saved.getId()));
        return saved;
    }
}
