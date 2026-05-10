package com.livertumor.segmentation.service;

import com.livertumor.segmentation.persistence.VolumeEntity;
import com.livertumor.segmentation.persistence.VolumeRepository;
import com.livertumor.segmentation.persistence.VolumeFormat;
import com.livertumor.segmentation.service.storage.ObjectStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class VolumeUploadService {

    private final VolumeRepository volumeRepository;
    private final ObjectStorageService objectStorageService;

    public VolumeUploadService(VolumeRepository volumeRepository, ObjectStorageService objectStorageService) {
        this.volumeRepository = volumeRepository;
        this.objectStorageService = objectStorageService;
    }

    @Transactional
    public VolumeEntity uploadVolume(String ownerId, List<MultipartFile> files, VolumeFormat format) {
        if (files == null || files.isEmpty() || files.stream().allMatch(MultipartFile::isEmpty)) {
            throw new IllegalArgumentException("At least one file is required");
        }
        List<MultipartFile> nonEmpty = files.stream().filter(f -> f != null && !f.isEmpty()).toList();
        if (nonEmpty.isEmpty()) {
            throw new IllegalArgumentException("At least one non-empty file is required");
        }

        var stored = objectStorageService.storeUpload(nonEmpty.get(0));
        String displayName = nonEmpty.get(0).getOriginalFilename();
        if (!StringUtils.hasText(displayName)) {
            displayName = stored.fileName();
        }
        long totalBytes = nonEmpty.stream().mapToLong(MultipartFile::getSize).sum();

        VolumeEntity v = VolumeEntity.create(
                ownerId, displayName, format, stored.fileName(), totalBytes, nonEmpty.size(), stored.sha256Hex());
        return volumeRepository.save(v);
    }
}
