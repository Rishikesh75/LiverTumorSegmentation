package com.livertumor.segmentation.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobEventRepository extends JpaRepository<JobEventEntity, Long> {
    void deleteByJobId(String jobId);
}
