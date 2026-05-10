package com.livertumor.segmentation.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.WebhookSubscriptionEntity;
import com.livertumor.segmentation.persistence.WebhookSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WebhookDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(WebhookDeliveryService.class);

    private final WebhookSubscriptionRepository webhookSubscriptionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WebhookDeliveryService(
            WebhookSubscriptionRepository webhookSubscriptionRepository, RestTemplate restTemplate) {
        this.webhookSubscriptionRepository = webhookSubscriptionRepository;
        this.restTemplate = restTemplate;
    }

    public void deliverJobCompleted(SegmentationJobEntity job) {
        List<WebhookSubscriptionEntity> subs =
                webhookSubscriptionRepository.findByOwnerIdAndEnabledIsTrue(job.getOwnerId());
        if (subs.isEmpty()) {
            return;
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("event", "job.completed");
        payload.put("jobId", job.getId());
        payload.put("status", job.getStatus().name());
        payload.put("modelType", job.getModelType());
        payload.put("modelVersion", job.getModelVersion());
        payload.put("volumeId", job.getVolumeId());
        String body;
        try {
            body = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.warn("Webhook payload serialization failed: {}", e.getMessage());
            return;
        }
        for (WebhookSubscriptionEntity s : subs) {
            try {
                String sig = hmacSha256Hex(s.getSecret(), body);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.add("X-Liver-Signature", "sha256=" + sig);
                restTemplate.exchange(
                        s.getTargetUrl(), HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
            } catch (Exception ex) {
                log.warn("Webhook delivery failed for job {} to {}: {}", job.getId(), s.getTargetUrl(), ex.getMessage());
            }
        }
    }

    private static String hmacSha256Hex(String secret, String body) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(raw);
    }
}
