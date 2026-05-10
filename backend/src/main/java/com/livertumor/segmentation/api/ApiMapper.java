package com.livertumor.segmentation.api;

import com.livertumor.segmentation.api.dto.ApiDtos;
import com.livertumor.segmentation.config.AppProperties;
import com.livertumor.segmentation.persistence.JobStatus;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.VolumeEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class ApiMapper {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    private ApiMapper() {
    }

    public static ApiDtos.VolumeResponse volume(VolumeEntity v) {
        return new ApiDtos.VolumeResponse(
                v.getId(),
                v.getOwnerId(),
                v.getDisplayName(),
                v.getFormat().name(),
                v.getSizeBytes(),
                v.getFileCount(),
                ISO.format(v.getCreatedAt()));
    }

    public static ApiDtos.JobResponse job(SegmentationJobEntity j, AppProperties appProperties) {
        String base = appProperties.getPublicBaseUrl().replaceAll("/$", "");
        List<String> previews = new ArrayList<>();
        if (j.getStatus() == JobStatus.completed && StringUtils.hasText(j.getOutputFileName())) {
            String enc = UriUtils.encodePathSegment(j.getOutputFileName(), StandardCharsets.UTF_8);
            previews.add(base + "/api/images/" + enc + "?type=output");
        }
        return new ApiDtos.JobResponse(
                j.getId(),
                j.getOwnerId(),
                j.getVolumeId(),
                j.getVolumeDisplayName(),
                j.getModelType(),
                j.getStatus().name(),
                ISO.format(j.getCreatedAt()),
                ISO.format(j.getUpdatedAt()),
                j.getErrorMessage(),
                previews.isEmpty() ? null : previews);
    }

    public static ApiDtos.JobResultsResponse results(SegmentationJobEntity j, AppProperties appProperties) {
        String base = appProperties.getPublicBaseUrl().replaceAll("/$", "");
        List<String> previews = new ArrayList<>();
        String mask = null;
        if (StringUtils.hasText(j.getOutputFileName())) {
            String enc = UriUtils.encodePathSegment(j.getOutputFileName(), StandardCharsets.UTF_8);
            mask = base + "/api/images/" + enc + "?type=output";
            previews.add(mask);
        }
        return new ApiDtos.JobResultsResponse(j.getId(), mask, previews, j.getModelVersion());
    }

    public static Map<String, Long> jobsByModel(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }
        return map;
    }
}
