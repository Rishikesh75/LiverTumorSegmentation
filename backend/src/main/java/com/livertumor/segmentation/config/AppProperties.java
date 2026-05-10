package com.livertumor.segmentation.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jobs jobs = new Jobs();
    private final Retention retention = new Retention();
    private final Storage storage = new Storage();
    private String publicBaseUrl = "http://localhost:8080";

    public Jobs getJobs() {
        return jobs;
    }

    public Retention getRetention() {
        return retention;
    }

    public Storage getStorage() {
        return storage;
    }

    public String getPublicBaseUrl() {
        return publicBaseUrl;
    }

    public void setPublicBaseUrl(String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl;
    }

    public static class Jobs {
        /** Max concurrent ML runs (semaphore). */
        private int maxConcurrent = 2;

        public int getMaxConcurrent() {
            return maxConcurrent;
        }

        public void setMaxConcurrent(int maxConcurrent) {
            this.maxConcurrent = maxConcurrent;
        }
    }

    public static class Retention {
        /** Days before soft-deleted volumes and old job files are purged. 0 disables scheduled purge. */
        private int days = 90;

        public int getDays() {
            return days;
        }

        public void setDays(int days) {
            this.days = days;
        }
    }

    public static class Storage {
        /**
         * When true, callers may wrap bytes with {@link com.livertumor.segmentation.service.encryption.EncryptionService}
         * before persistence (hook for future KMS integration).
         */
        private boolean encryptionEnabled = false;

        public boolean isEncryptionEnabled() {
            return encryptionEnabled;
        }

        public void setEncryptionEnabled(boolean encryptionEnabled) {
            this.encryptionEnabled = encryptionEnabled;
        }
    }
}
