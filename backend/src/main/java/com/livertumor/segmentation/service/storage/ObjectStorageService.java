package com.livertumor.segmentation.service.storage;

import com.livertumor.segmentation.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;

public interface ObjectStorageService {

    FileStorageService.StoredUpload storeUpload(MultipartFile file);

    void deleteUpload(String storedFileName);

    void deleteOutput(String outputFileName);
}
