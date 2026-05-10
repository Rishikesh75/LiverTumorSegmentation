package com.livertumor.segmentation.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface VolumeRepository extends JpaRepository<VolumeEntity, String> {
    Optional<VolumeEntity> findByIdAndOwnerIdAndDeletedAtIsNull(String id, String ownerId);

    List<VolumeEntity> findByOwnerIdAndDeletedAtIsNull(String ownerId);

    List<VolumeEntity> findByDeletedAtIsNullAndCreatedAtBefore(Instant cutoff);

    List<VolumeEntity> findByCreatedAtBefore(Instant cutoff);

    long countByOwnerIdAndDeletedAtIsNull(String ownerId);
}
