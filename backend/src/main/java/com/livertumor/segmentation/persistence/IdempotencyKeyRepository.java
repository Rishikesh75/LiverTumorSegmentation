package com.livertumor.segmentation.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKeyEntity, IdempotencyKeyEntity.Pk> {
    Optional<IdempotencyKeyEntity> findByOwnerIdAndIdempotencyKey(String ownerId, String idempotencyKey);

    void deleteByJobId(String jobId);
}
