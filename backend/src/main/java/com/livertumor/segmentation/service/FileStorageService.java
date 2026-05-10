package com.livertumor.segmentation.service;

import com.livertumor.segmentation.config.FileStorageConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
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
        return storeFileWithDigest(file).fileName();
    }

    /**
     * Stores upload under a unique name and returns SHA-256 of stored bytes.
     */
    public StoredUpload storeFileWithDigest(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = this.uploadLocation.resolve(fileName);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream raw = file.getInputStream();
                 DigestInputStream in = new DigestInputStream(raw, digest)) {
                Files.copy(in, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            String sha256 = HexFormat.of().formatHex(digest.digest());
            long size = Files.size(targetLocation);
            return new StoredUpload(fileName, sha256, size);
        } catch (Exception ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    public void deleteUploadIfExists(String storedFileName) {
        try {
            if (storedFileName == null || storedFileName.isBlank()) {
                return;
            }
            Path p = this.uploadLocation.resolve(storedFileName).normalize();
            if (p.startsWith(this.uploadLocation)) {
                Files.deleteIfExists(p);
            }
        } catch (IOException ignored) {
            // best-effort retention cleanup
        }
    }

    public void deleteOutputIfExists(String outputFileName) {
        try {
            if (outputFileName == null || outputFileName.isBlank()) {
                return;
            }
            Path p = this.outputLocation.resolve(outputFileName).normalize();
            if (p.startsWith(this.outputLocation)) {
                Files.deleteIfExists(p);
            }
        } catch (IOException ignored) {
            // best-effort retention cleanup
        }
    }

    public record StoredUpload(String fileName, String sha256Hex, long sizeBytes) {
    }

    public Path getUploadLocation() {
        return uploadLocation;
    }

    public Path getOutputLocation() {
        return outputLocation;
    }
}

