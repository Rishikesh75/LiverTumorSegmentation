package com.livertumor.segmentation.service;

import com.livertumor.segmentation.persistence.AppUser;
import com.livertumor.segmentation.persistence.AppUserRepository;
import java.time.Instant;
import java.util.Optional;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Optional;

@Service
public class UserProvisioningService {

    private final AppUserRepository appUserRepository;

    public UserProvisioningService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public AppUser ensurePersisted(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new IllegalStateException("Not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User ou) {
            return syncOAuthUser(ou);
        }
        if (principal instanceof UserDetails ud) {
            return appUserRepository
                    .findByEmailIgnoreCase(ud.getUsername())
                    .orElseThrow(() -> new IllegalStateException("Local user not provisioned: " + ud.getUsername()));
        }
        throw new IllegalStateException("Unsupported principal: " + principal.getClass());
    }

    @Transactional
    public AppUser syncOAuthUser(OAuth2User ou) {
        String sub = ou.getAttribute("sub") != null ? ou.getAttribute("sub").toString() : ou.getName();
        String email = ou.getAttribute("email") != null ? ou.getAttribute("email").toString().trim() : "";
        String name = ou.getAttribute("name") != null ? ou.getAttribute("name").toString() : null;

        Optional<AppUser> bySub = appUserRepository.findByGoogleSub(sub);
        if (bySub.isPresent()) {
            AppUser u = bySub.get();
            boolean dirty = false;
            if (StringUtils.hasText(email) && !email.equalsIgnoreCase(u.getEmail())) {
                u.setEmail(email);
                dirty = true;
            }
            if (StringUtils.hasText(name) && !name.equals(u.getDisplayName())) {
                u.setDisplayName(name);
                dirty = true;
            }
            if (dirty) {
                u.setUpdatedAt(Instant.now());
                return appUserRepository.save(u);
            }
            return u;
        }

        if (StringUtils.hasText(email)) {
            Optional<AppUser> byEmail = appUserRepository.findByEmailIgnoreCase(email);
            if (byEmail.isPresent()) {
                AppUser u = byEmail.get();
                u.setGoogleSub(sub);
                if (StringUtils.hasText(name)) {
                    u.setDisplayName(name);
                }
                u.setUpdatedAt(Instant.now());
                return appUserRepository.save(u);
            }
        }

        AppUser created = AppUser.newOAuthUser(
                StringUtils.hasText(email) ? email : (sub + "@oauth.local"),
                name,
                sub);
        return appUserRepository.save(created);
    }
}
