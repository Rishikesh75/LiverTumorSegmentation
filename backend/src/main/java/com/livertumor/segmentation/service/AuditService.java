package com.livertumor.segmentation.service;

import com.livertumor.segmentation.persistence.AuditLogEntity;
import com.livertumor.segmentation.persistence.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String actorUserId, String action, String resourceType, String resourceId, String ip, String detail) {
        auditLogRepository.save(AuditLogEntity.create(actorUserId, action, resourceType, resourceId, ip, detail));
    }
}
