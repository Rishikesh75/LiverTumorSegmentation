package com.livertumor.segmentation.controller;

import com.livertumor.segmentation.controller.AuthController.SessionResponse;
import com.livertumor.segmentation.controller.AuthController.UserDto;
import com.livertumor.segmentation.api.dto.ApiDtos;
import com.livertumor.segmentation.config.OpenApiConfig;
import com.livertumor.segmentation.service.UserAccountService;
import com.livertumor.segmentation.service.UserAnalyticsService;
import com.livertumor.segmentation.service.UserProvisioningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
@Tag(name = "Account", description = "Profile, analytics, webhooks")
public class UserAccountRestController {

    private final UserProvisioningService userProvisioningService;
    private final UserAccountService userAccountService;
    private final UserAnalyticsService userAnalyticsService;

    public UserAccountRestController(
            UserProvisioningService userProvisioningService,
            UserAccountService userAccountService,
            UserAnalyticsService userAnalyticsService) {
        this.userProvisioningService = userProvisioningService;
        this.userAccountService = userAccountService;
        this.userAnalyticsService = userAnalyticsService;
    }

    @GetMapping("/analytics")
    @Operation(summary = "Analytics for current user")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public ApiDtos.AnalyticsResponse analytics(Authentication authentication) {
        var user = userProvisioningService.ensurePersisted(authentication);
        return userAnalyticsService.analyticsForUser(user.getId());
    }

    @PatchMapping
    @Operation(summary = "Update profile fields")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public SessionResponse patchProfile(Authentication authentication, @RequestBody ApiDtos.PatchUserRequest body) {
        var user = userProvisioningService.ensurePersisted(authentication);
        var updated = userAccountService.patchProfile(user.getId(), body.displayName(), body.organization());
        return new SessionResponse(
                new UserDto(updated.getId(), updated.getEmail(), updated.getDisplayName(), updated.getOrganization()),
                "cookie");
    }

    @PutMapping("/webhook")
    @Operation(summary = "Register or replace outbound webhook for job events")
    @SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE)
    public ResponseEntity<Void> upsertWebhook(
            Authentication authentication, @RequestBody ApiDtos.WebhookUpsertRequest body) {
        var user = userProvisioningService.ensurePersisted(authentication);
        try {
            userAccountService.upsertWebhook(user.getId(), body.targetUrl(), body.secret());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
