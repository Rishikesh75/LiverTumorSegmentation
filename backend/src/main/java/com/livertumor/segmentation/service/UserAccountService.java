package com.livertumor.segmentation.service;

import com.livertumor.segmentation.persistence.AppUser;
import com.livertumor.segmentation.persistence.AppUserRepository;
import com.livertumor.segmentation.persistence.WebhookSubscriptionEntity;
import com.livertumor.segmentation.persistence.WebhookSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserAccountService {

    private final AppUserRepository appUserRepository;
    private final WebhookSubscriptionRepository webhookSubscriptionRepository;

    public UserAccountService(
            AppUserRepository appUserRepository, WebhookSubscriptionRepository webhookSubscriptionRepository) {
        this.appUserRepository = appUserRepository;
        this.webhookSubscriptionRepository = webhookSubscriptionRepository;
    }

    @Transactional
    public AppUser patchProfile(String ownerId, String displayName, String organization) {
        AppUser u = appUserRepository.findById(ownerId).orElseThrow();
        if (displayName != null) {
            u.setDisplayName(displayName.isBlank() ? null : displayName.trim());
        }
        if (organization != null) {
            u.setOrganization(organization.isBlank() ? null : organization.trim());
        }
        u.setUpdatedAt(java.time.Instant.now());
        return appUserRepository.save(u);
    }

    @Transactional
    public WebhookSubscriptionEntity upsertWebhook(String ownerId, String targetUrl, String secret) {
        if (!StringUtils.hasText(targetUrl) || !StringUtils.hasText(secret)) {
            throw new IllegalArgumentException("targetUrl and secret are required");
        }
        var existing = webhookSubscriptionRepository.findFirstByOwnerIdOrderByCreatedAtDesc(ownerId);
        if (existing.isPresent()) {
            WebhookSubscriptionEntity w = existing.get();
            w.setTargetUrl(targetUrl.trim());
            w.setSecret(secret);
            w.setEnabled(true);
            return webhookSubscriptionRepository.save(w);
        }
        return webhookSubscriptionRepository.save(WebhookSubscriptionEntity.create(ownerId, targetUrl.trim(), secret));
    }
}
