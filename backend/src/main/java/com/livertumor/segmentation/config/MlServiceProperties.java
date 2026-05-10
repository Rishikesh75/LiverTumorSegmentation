package com.livertumor.segmentation.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ml.service")
public class MlServiceProperties {

    private String url = "http://localhost:5000";
    /** Logical model version recorded on each job for reproducibility. */
    private String modelVersion = "1.0.0";

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}
