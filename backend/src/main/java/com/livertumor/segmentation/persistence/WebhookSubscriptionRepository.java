package com.livertumor.segmentation.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebhookSubscriptionRepository extends JpaRepository<WebhookSubscriptionEntity, String> {
    List<WebhookSubscriptionEntity> findByOwnerIdAndEnabledIsTrue(String ownerId);

    Optional<WebhookSubscriptionEntity> findFirstByOwnerIdOrderByCreatedAtDesc(String ownerId);
}
