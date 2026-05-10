package com.livertumor.segmentation.api.dto;

import java.util.List;
import java.util.Map;

public final class ApiDtos {

    private ApiDtos() {
    }

    public record VolumeResponse(
            String id,
            String userId,
            String displayName,
            String format,
            long sizeBytes,
            int fileCount,
            String createdAt) {
    }

    public record CreateJobRequest(
            @jakarta.validation.constraints.NotBlank String volumeId,
            @jakarta.validation.constraints.NotBlank String modelType,
            String notificationEmail,
            String volumeDisplayName) {
    }

    public record JobResponse(
            String id,
            String userId,
            String volumeId,
            String volumeName,
            String modelType,
            String status,
            String createdAt,
            String updatedAt,
            String errorMessage,
            List<String> resultPreviewUrls) {
    }

    public record JobResultsResponse(String jobId, String maskUrl, List<String> previewUrls, String modelVersion) {
    }

    public record AnalyticsResponse(
            String userId,
            long totalUploads,
            long totalJobs,
            long completedJobs,
            long failedJobs,
            long runningOrQueuedJobs,
            Map<String, Long> jobsByModel,
            List<JobResponse> recentJobs) {
    }

    public record PatchUserRequest(String displayName, String organization) {
    }

    public record WebhookUpsertRequest(String targetUrl, String secret) {
    }

    public record NotifyJobRequest(String email) {
    }
}
