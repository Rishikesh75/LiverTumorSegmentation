package com.livertumor.segmentation.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "job_events")
public class JobEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", length = 36, nullable = false)
    private String jobId;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(name = "message", length = 4000)
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected JobEventEntity() {
    }

    public static JobEventEntity of(String jobId, String eventType, String message) {
        JobEventEntity e = new JobEventEntity();
        e.jobId = jobId;
        e.eventType = eventType;
        e.message = message;
        e.createdAt = Instant.now();
        return e;
    }

    public Long getId() {
        return id;
    }

    public String getJobId() {
        return jobId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getMessage() {
        return message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
