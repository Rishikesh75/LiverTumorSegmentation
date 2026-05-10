package com.livertumor.segmentation.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "segmentation_jobs")
public class SegmentationJobEntity {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @Column(name = "owner_id", length = 36, nullable = false)
    private String ownerId;

    @Column(name = "volume_id", length = 36, nullable = false)
    private String volumeId;

    @Column(name = "volume_display_name", nullable = false, length = 512)
    private String volumeDisplayName;

    @Column(name = "model_type", nullable = false, length = 128)
    private String modelType;

    @Column(name = "model_version", nullable = false, length = 64)
    private String modelVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private JobStatus status = JobStatus.queued;

    @Column(name = "error_message", length = 4000)
    private String errorMessage;

    @Column(name = "output_file_name", length = 512)
    private String outputFileName;

    @Column(name = "notification_email", length = 320)
    private String notificationEmail;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SegmentationJobEntity() {
    }

    public static SegmentationJobEntity queued(
            String ownerId,
            String volumeId,
            String volumeDisplayName,
            String modelType,
            String modelVersion,
            String notificationEmail,
            String idempotencyKey) {
        SegmentationJobEntity j = new SegmentationJobEntity();
        j.id = UUID.randomUUID().toString();
        j.ownerId = ownerId;
        j.volumeId = volumeId;
        j.volumeDisplayName = volumeDisplayName;
        j.modelType = modelType;
        j.modelVersion = modelVersion;
        j.notificationEmail = notificationEmail;
        j.idempotencyKey = idempotencyKey;
        Instant now = Instant.now();
        j.createdAt = now;
        j.updatedAt = now;
        j.status = JobStatus.queued;
        return j;
    }

    public String getId() {
        return id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getVolumeId() {
        return volumeId;
    }

    public String getVolumeDisplayName() {
        return volumeDisplayName;
    }

    public void setVolumeDisplayName(String volumeDisplayName) {
        this.volumeDisplayName = volumeDisplayName;
    }

    public String getModelType() {
        return modelType;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getOutputFileName() {
        return outputFileName;
    }

    public void setOutputFileName(String outputFileName) {
        this.outputFileName = outputFileName;
    }

    public String getNotificationEmail() {
        return notificationEmail;
    }

    public void setNotificationEmail(String notificationEmail) {
        this.notificationEmail = notificationEmail;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void touch() {
        this.updatedAt = Instant.now();
    }
}
