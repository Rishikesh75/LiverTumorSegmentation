package com.livertumor.segmentation.job;

import com.livertumor.segmentation.config.AppProperties;
import org.springframework.stereotype.Component;

import java.util.concurrent.Semaphore;

@Component
public class JobExecutionGate {

    private final Semaphore semaphore;

    public JobExecutionGate(AppProperties appProperties) {
        int permits = Math.max(1, appProperties.getJobs().getMaxConcurrent());
        this.semaphore = new Semaphore(permits);
    }

    public void acquire() {
        semaphore.acquireUninterruptibly();
    }

    public void release() {
        semaphore.release();
    }
}
