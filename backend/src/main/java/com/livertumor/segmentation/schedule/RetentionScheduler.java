package com.livertumor.segmentation.schedule;

import com.livertumor.segmentation.service.RetentionCleanupService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RetentionScheduler {

    private final RetentionCleanupService retentionCleanupService;

    public RetentionScheduler(RetentionCleanupService retentionCleanupService) {
        this.retentionCleanupService = retentionCleanupService;
    }

    @Scheduled(cron = "${app.retention.cron:0 0 4 * * *}")
    public void purge() {
        retentionCleanupService.purgeExpiredVolumes();
    }
}
