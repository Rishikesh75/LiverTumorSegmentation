package com.livertumor.segmentation.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "idempotency_keys")
@IdClass(IdempotencyKeyEntity.Pk.class)
public class IdempotencyKeyEntity {

    @Id
    @Column(name = "owner_id", length = 36, nullable = false)
    private String ownerId;

    @Id
    @Column(name = "idempotency_key", length = 128, nullable = false)
    private String idempotencyKey;

    @Column(name = "job_id", length = 36, nullable = false)
    private String jobId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected IdempotencyKeyEntity() {
    }

    public IdempotencyKeyEntity(String ownerId, String idempotencyKey, String jobId) {
        this.ownerId = ownerId;
        this.idempotencyKey = idempotencyKey;
        this.jobId = jobId;
        this.createdAt = Instant.now();
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getJobId() {
        return jobId;
    }

    public static class Pk implements Serializable {
        private String ownerId;
        private String idempotencyKey;

        public Pk() {
        }

        public Pk(String ownerId, String idempotencyKey) {
            this.ownerId = ownerId;
            this.idempotencyKey = idempotencyKey;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (o == null || getClass() != o.getClass()) {
                return false;
            }
            Pk pk = (Pk) o;
            return Objects.equals(ownerId, pk.ownerId) && Objects.equals(idempotencyKey, pk.idempotencyKey);
        }

        @Override
        public int hashCode() {
            return Objects.hash(ownerId, idempotencyKey);
        }
    }
}
