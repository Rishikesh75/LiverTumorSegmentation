package com.livertumor.segmentation.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SegmentationJobRepository extends JpaRepository<SegmentationJobEntity, String> {
    List<SegmentationJobEntity> findByOwnerIdOrderByUpdatedAtDesc(String ownerId);

    Optional<SegmentationJobEntity> findByIdAndOwnerId(String id, String ownerId);

    long countByOwnerId(String ownerId);

    long countByOwnerIdAndStatus(String ownerId, JobStatus status);

    List<SegmentationJobEntity> findByVolumeId(String volumeId);

    @org.springframework.data.jpa.repository.Query(
            "select j.modelType, count(j) from SegmentationJobEntity j where j.ownerId = :ownerId group by j.modelType")
    List<Object[]> countByModelGrouped(@org.springframework.data.repository.query.Param("ownerId") String ownerId);
}
