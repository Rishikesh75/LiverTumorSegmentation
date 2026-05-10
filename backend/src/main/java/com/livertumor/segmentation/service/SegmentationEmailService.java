package com.livertumor.segmentation.service;

import com.livertumor.segmentation.config.SegmentationEmailProperties;
import com.livertumor.segmentation.persistence.AppUser;
import com.livertumor.segmentation.persistence.AppUserRepository;
import com.livertumor.segmentation.persistence.JobStatus;
import com.livertumor.segmentation.persistence.SegmentationJobEntity;
import com.livertumor.segmentation.persistence.VolumeEntity;
import com.livertumor.segmentation.model.SegmentationRequest;
import com.livertumor.segmentation.model.SegmentationResponse;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Sends a Gmail (SMTP) notification after segmentation succeeds.
 * <p>
 * Enable with {@code app.notification.email.enabled=true} and set {@code spring.mail.username} /
 * {@code spring.mail.password} (Gmail app password recommended).
 */
@Service
public class SegmentationEmailService {

    private static final Logger logger = LoggerFactory.getLogger(SegmentationEmailService.class);

    private final SegmentationEmailProperties properties;
    private final JavaMailSender mailSender;
    private final SegmentationEmailService self;
    private final AppUserRepository appUserRepository;

    @Value("${spring.mail.username:}")
    private String mailFromUsername;

    @Autowired
    public SegmentationEmailService(
            SegmentationEmailProperties properties,
            @Autowired(required = false) JavaMailSender mailSender,
            @Lazy SegmentationEmailService self,
            AppUserRepository appUserRepository) {
        this.properties = properties;
        this.mailSender = mailSender;
        this.self = self;
        this.appUserRepository = appUserRepository;
    }

    /**
     * Resolve the recipient on the HTTP thread (needed because {@link #notifySegmentationComplete} is async).
     */
    public String resolveRecipientEmail(SegmentationRequest request) {
        return resolveRecipient(request);
    }

    /**
     * Recipient for async jobs where {@link SecurityContextHolder} is not populated.
     */
    public String resolveRecipientEmailForJob(SegmentationRequest request, String ownerEmailFallback) {
        if (request != null && StringUtils.hasText(request.getNotificationEmail())) {
            return request.getNotificationEmail().trim();
        }
        return ownerEmailFallback != null ? ownerEmailFallback.trim() : null;
    }

    /**
     * Fire-and-forget completion email for volumetric/async pipeline.
     */
    public void scheduleAsyncJobCompletion(
            SegmentationJobEntity job, VolumeEntity volume, SegmentationResponse response, String ownerEmailFallback) {
        if (!properties.isEnabled()) {
            return;
        }
        SegmentationRequest surrogate = new SegmentationRequest(job.getModelType(), volume.getStoredFileName());
        surrogate.setNotificationEmail(job.getNotificationEmail());
        String recipient = resolveRecipientEmailForJob(surrogate, ownerEmailFallback);
        self.notifySegmentationComplete(recipient, surrogate, response);
    }

    /**
     * Explicit resend for completed jobs (POST /api/jobs/:id/notify).
     */
    public void sendManualJobNotification(SegmentationJobEntity job, VolumeEntity volume, String emailOverride) {
        if (!properties.isEnabled()) {
            return;
        }
        if (job.getStatus() != JobStatus.completed || !StringUtils.hasText(job.getOutputFileName())) {
            throw new IllegalStateException("Job must be completed with an output artifact");
        }
        SegmentationResponse response = new SegmentationResponse(
                "Segmentation result notification",
                job.getOutputFileName(),
                volume.getStoredFileName(),
                true,
                job.getModelType());
        SegmentationRequest surrogate = new SegmentationRequest(job.getModelType(), volume.getStoredFileName());
        surrogate.setNotificationEmail(emailOverride);
        AppUser owner = appUserRepository.findById(job.getOwnerId()).orElse(null);
        String fallback = owner != null ? owner.getEmail() : null;
        String recipient = resolveRecipientEmailForJob(surrogate, fallback);
        self.notifySegmentationComplete(recipient, surrogate, response);
    }

    /**
     * Called from the request thread after successful segmentation; resolves the recipient here, then sends async.
     */
    public void scheduleCompletionNotification(SegmentationRequest request, SegmentationResponse response) {
        if (!properties.isEnabled()) {
            return;
        }
        self.notifySegmentationComplete(resolveRecipientEmail(request), request, response);
    }

    /**
     * Fire-and-forget from the request thread; delivery happens asynchronously.
     */
    @org.springframework.scheduling.annotation.Async
    public void notifySegmentationComplete(String recipientEmail, SegmentationRequest request, SegmentationResponse response) {
        if (!properties.isEnabled()) {
            return;
        }
        if (mailSender == null) {
            logger.warn("Segmentation email is enabled but JavaMailSender is not configured (set spring.mail.host/username/password)");
            return;
        }
        String recipient = recipientEmail != null ? recipientEmail.trim() : "";
        if (!StringUtils.hasText(recipient)) {
            logger.debug("Skipping segmentation notification email: no recipient email");
            return;
        }
        if (!StringUtils.hasText(mailFromUsername)) {
            logger.warn("Skipping segmentation notification email: spring.mail.username is empty");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(mailFromUsername);
            helper.setTo(recipient);
            helper.setSubject(properties.getSubjectPrefix() + " — completed");
            helper.setText(buildBody(request, response), false);
            mailSender.send(message);
            logger.info("Sent segmentation completion email to {}", recipient);
        } catch (Exception e) {
            logger.error("Failed to send segmentation completion email to {}: {}", recipient, e.getMessage());
        }
    }

    private static String resolveRecipient(SegmentationRequest request) {
        if (request != null && StringUtils.hasText(request.getNotificationEmail())) {
            return request.getNotificationEmail().trim();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof OAuth2User ou) {
            Object email = ou.getAttribute("email");
            return email != null ? email.toString().trim() : null;
        }
        if (principal instanceof UserDetails ud) {
            return ud.getUsername() != null ? ud.getUsername().trim() : null;
        }
        return null;
    }

    private static String buildBody(SegmentationRequest request, SegmentationResponse response) {
        StringBuilder sb = new StringBuilder();
        sb.append("Your liver tumor segmentation job finished successfully.\n\n");
        if (request != null) {
            sb.append("Model: ").append(nullToDash(request.getModelType())).append('\n');
            sb.append("Input image: ").append(nullToDash(request.getImagePath())).append('\n');
        }
        if (response != null) {
            sb.append("Output: ").append(nullToDash(response.getSegmentedImagePath())).append('\n');
            sb.append("Model used: ").append(nullToDash(response.getModelUsed())).append('\n');
            if (StringUtils.hasText(response.getMessage())) {
                sb.append('\n').append(response.getMessage()).append('\n');
            }
        }
        return sb.toString();
    }

    private static String nullToDash(String value) {
        return StringUtils.hasText(value) ? value : "—";
    }
}
