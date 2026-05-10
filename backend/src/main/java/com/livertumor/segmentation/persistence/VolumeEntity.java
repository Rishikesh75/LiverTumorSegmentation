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
@Table(name = "volumes")
public class VolumeEntity {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @Column(name = "owner_id", length = 36, nullable = false)
    private String ownerId;

    @Column(name = "display_name", nullable = false, length = 512)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "format", nullable = false, length = 32)
    private VolumeFormat format;

    @Column(name = "stored_file_name", nullable = false, length = 512)
    private String storedFileName;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "file_count", nullable = false)
    private int fileCount = 1;

    @Column(name = "sha256", length = 64)
    private String sha256;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected VolumeEntity() {
    }

    public static VolumeEntity create(
            String ownerId,
            String displayName,
            VolumeFormat format,
            String storedFileName,
            long sizeBytes,
            int fileCount,
            String sha256) {
        VolumeEntity v = new VolumeEntity();
        v.id = UUID.randomUUID().toString();
        v.ownerId = ownerId;
        v.displayName = displayName;
        v.format = format;
        v.storedFileName = storedFileName;
        v.sizeBytes = sizeBytes;
        v.fileCount = fileCount;
        v.sha256 = sha256;
        v.createdAt = Instant.now();
        return v;
    }

    public String getId() {
        return id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public VolumeFormat getFormat() {
        return format;
    }

    public String getStoredFileName() {
        return storedFileName;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public int getFileCount() {
        return fileCount;
    }

    public String getSha256() {
        return sha256;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
