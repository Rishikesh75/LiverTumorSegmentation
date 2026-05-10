package com.livertumor.segmentation.job;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class JobQueuedListener {

    private final AsyncSegmentationJobProcessor processor;

    public JobQueuedListener(AsyncSegmentationJobProcessor processor) {
        this.processor = processor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onQueued(JobQueuedEvent event) {
        processor.processJobAsync(event.jobId());
    }
}
