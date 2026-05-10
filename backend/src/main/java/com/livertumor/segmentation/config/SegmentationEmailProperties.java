package com.livertumor.segmentation.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notification.email")
public class SegmentationEmailProperties {

    /**
     * When false, no email is sent (default for local dev).
     */
    private boolean enabled = false;

    /**
     * Prefix for the email subject line.
     */
    private String subjectPrefix = "Liver tumor segmentation";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getSubjectPrefix() {
        return subjectPrefix;
    }

    public void setSubjectPrefix(String subjectPrefix) {
        this.subjectPrefix = subjectPrefix;
    }
}
