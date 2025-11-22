package com.livertumor.segmentation.service;

import com.livertumor.segmentation.config.FileStorageConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadLocation;
    private final Path outputLocation;

    @Autowired
    public FileStorageService(FileStorageConfig fileStorageConfig) {
        this.uploadLocation = Paths.get(fileStorageConfig.getUploadDir())
                .toAbsolutePath().normalize();
        this.outputLocation = Paths.get(fileStorageConfig.getOutputDir())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadLocation);
            Files.createDirectories(this.outputLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload/output directories!", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = this.uploadLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    public Path getUploadLocation() {
        return uploadLocation;
    }

    public Path getOutputLocation() {
        return outputLocation;
    }
}

