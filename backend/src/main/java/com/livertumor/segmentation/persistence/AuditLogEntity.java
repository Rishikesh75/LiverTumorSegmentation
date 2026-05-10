package com.livertumor.segmentation.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id", length = 36)
    private String actorUserId;

    @Column(name = "action", nullable = false, length = 128)
    private String action;

    @Column(name = "resource_type", nullable = false, length = 64)
    private String resourceType;

    @Column(name = "resource_id", length = 128)
    private String resourceId;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "detail", length = 4000)
    private String detail;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuditLogEntity() {
    }

    public static AuditLogEntity create(
            String actorUserId, String action, String resourceType, String resourceId, String ip, String detail) {
        AuditLogEntity a = new AuditLogEntity();
        a.actorUserId = actorUserId;
        a.action = action;
        a.resourceType = resourceType;
        a.resourceId = resourceId;
        a.ipAddress = ip;
        a.detail = detail;
        a.createdAt = Instant.now();
        return a;
    }

    public Long getId() {
        return id;
    }
}
