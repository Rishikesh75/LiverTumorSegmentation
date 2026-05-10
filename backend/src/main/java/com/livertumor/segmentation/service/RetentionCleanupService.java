package com.livertumor.segmentation.service;

import com.livertumor.segmentation.config.AppProperties;
import com.livertumor.segmentation.persistence.VolumeEntity;
import com.livertumor.segmentation.persistence.VolumeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class RetentionCleanupService {

    private static final Logger log = LoggerFactory.getLogger(RetentionCleanupService.class);

    private final AppProperties appProperties;
    private final VolumeRepository volumeRepository;
    private final VolumePurgeService volumePurgeService;

    public RetentionCleanupService(
            AppProperties appProperties,
            VolumeRepository volumeRepository,
            VolumePurgeService volumePurgeService) {
        this.appProperties = appProperties;
        this.volumeRepository = volumeRepository;
        this.volumePurgeService = volumePurgeService;
    }

    public void purgeExpiredVolumes() {
        int days = appProperties.getRetention().getDays();
        if (days <= 0) {
            return;
        }
        Instant cutoff = Instant.now().minus(days, ChronoUnit.DAYS);
        List<VolumeEntity> old = volumeRepository.findByCreatedAtBefore(cutoff);
        for (VolumeEntity v : old) {
            volumePurgeService.purgeVolume(v.getId());
        }
        if (!old.isEmpty()) {
            log.info("Retention purge removed {} volume(s) older than {} days", old.size(), days);
        }
    }
}
