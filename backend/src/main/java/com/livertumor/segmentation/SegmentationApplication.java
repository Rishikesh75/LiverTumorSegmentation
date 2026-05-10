package com.livertumor.segmentation;

import com.livertumor.segmentation.config.AppProperties;
import com.livertumor.segmentation.config.MlServiceProperties;
import com.livertumor.segmentation.config.SegmentationEmailProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties({SegmentationEmailProperties.class, AppProperties.class, MlServiceProperties.class})
public class SegmentationApplication {

    public static void main(String[] args) {
        SpringApplication.run(SegmentationApplication.class, args);
    }
}
