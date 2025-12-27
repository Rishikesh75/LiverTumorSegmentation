package com.livertumor.segmentation.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for REST client to communicate with ML microservice.
 */
@Configuration
public class RestClientConfig {

    @Value("${ml.service.timeout:300000}")
    private int timeout;

    /**
     * Create RestTemplate bean with custom timeout settings.
     * Timeout is set high to accommodate ML model inference time.
     *
     * @return configured RestTemplate
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeout);
        factory.setReadTimeout(timeout);
        return new RestTemplate(factory);
    }
}

