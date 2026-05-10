package com.livertumor.segmentation.service.storage;

import com.livertumor.segmentation.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Local disk object storage; swap for S3/MinIO in cloud deployments.
 */
@Service
public class LocalObjectStorageService implements ObjectStorageService {

    private final FileStorageService fileStorageService;

    public LocalObjectStorageService(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @Override
    public FileStorageService.StoredUpload storeUpload(MultipartFile file) {
        return fileStorageService.storeFileWithDigest(file);
    }

    @Override
    public void deleteUpload(String storedFileName) {
        fileStorageService.deleteUploadIfExists(storedFileName);
    }

    @Override
    public void deleteOutput(String outputFileName) {
        fileStorageService.deleteOutputIfExists(outputFileName);
    }
}
