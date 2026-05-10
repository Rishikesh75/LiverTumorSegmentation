package com.livertumor.segmentation.service;

import com.livertumor.segmentation.api.ApiMapper;
import com.livertumor.segmentation.api.dto.ApiDtos;
import com.livertumor.segmentation.config.AppProperties;
import com.livertumor.segmentation.persistence.JobStatus;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.SegmentationJobRepository;
import com.livertumor.segmentation.persistence.VolumeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserAnalyticsService {

    private final VolumeRepository volumeRepository;
    private final SegmentationJobRepository jobRepository;
    private final AppProperties appProperties;

    public UserAnalyticsService(
            VolumeRepository volumeRepository,
            SegmentationJobRepository jobRepository,
            AppProperties appProperties) {
        this.volumeRepository = volumeRepository;
        this.jobRepository = jobRepository;
        this.appProperties = appProperties;
    }

    public ApiDtos.AnalyticsResponse analyticsForUser(String ownerId) {
        long uploads = volumeRepository.countByOwnerIdAndDeletedAtIsNull(ownerId);
        long total = jobRepository.countByOwnerId(ownerId);
        long completed = jobRepository.countByOwnerIdAndStatus(ownerId, JobStatus.completed);
        long failed = jobRepository.countByOwnerIdAndStatus(ownerId, JobStatus.failed);
        long runningOrQueued =
                jobRepository.countByOwnerIdAndStatus(ownerId, JobStatus.queued)
                        + jobRepository.countByOwnerIdAndStatus(ownerId, JobStatus.running);

        var grouped = ApiMapper.jobsByModel(jobRepository.countByModelGrouped(ownerId));
        List<SegmentationJobEntity> recent = jobRepository.findByOwnerIdOrderByUpdatedAtDesc(ownerId).stream()
                .limit(10)
                .collect(Collectors.toList());
        List<ApiDtos.JobResponse> recentDtos =
                recent.stream().map(j -> ApiMapper.job(j, appProperties)).collect(Collectors.toList());

        return new ApiDtos.AnalyticsResponse(
                ownerId,
                uploads,
                total,
                completed,
                failed,
                runningOrQueued,
                grouped,
                recentDtos);
    }
}
