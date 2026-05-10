package com.livertumor.segmentation.job;

import com.livertumor.segmentation.persistence.JobEventEntity;
import com.livertumor.segmentation.persistence.JobEventRepository;
import com.livertumor.segmentation.persistence.JobStatus;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.SegmentationJobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SegmentationJobStateService {

    private final SegmentationJobRepository jobRepository;
    private final JobEventRepository jobEventRepository;

    public SegmentationJobStateService(
            SegmentationJobRepository jobRepository, JobEventRepository jobEventRepository) {
        this.jobRepository = jobRepository;
        this.jobEventRepository = jobEventRepository;
    }

    @Transactional
    public void markRunning(String jobId) {
        SegmentationJobEntity j = jobRepository.findById(jobId).orElseThrow();
        j.setStatus(JobStatus.running);
        j.touch();
        jobRepository.save(j);
        jobEventRepository.save(JobEventEntity.of(jobId, "running", null));
    }

    @Transactional
    public void markCompleted(String jobId, String outputFileName, String message) {
        SegmentationJobEntity j = jobRepository.findById(jobId).orElseThrow();
        j.setStatus(JobStatus.completed);
        j.setOutputFileName(outputFileName);
        j.setErrorMessage(null);
        j.touch();
        jobRepository.save(j);
        jobEventRepository.save(JobEventEntity.of(jobId, "completed", message));
    }

    @Transactional
    public void markFailed(String jobId, String error) {
        SegmentationJobEntity j = jobRepository.findById(jobId).orElseThrow();
        j.setStatus(JobStatus.failed);
        j.setErrorMessage(error);
        j.touch();
        jobRepository.save(j);
        jobEventRepository.save(JobEventEntity.of(jobId, "failed", error));
    }
}
