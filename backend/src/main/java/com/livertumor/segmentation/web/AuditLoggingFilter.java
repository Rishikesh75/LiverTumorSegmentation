package com.livertumor.segmentation.web;

import com.livertumor.segmentation.service.AuditService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Append-only API audit for mutating requests (actor principal name; optional user UUID can be layered later).
 */
@Component
public class AuditLoggingFilter extends OncePerRequestFilter {

    private final AuditService auditService;

    public AuditLoggingFilter(AuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        filterChain.doFilter(request, response);
        try {
            if (!request.getRequestURI().startsWith("/api/")) {
                return;
            }
            String m = request.getMethod();
            if (!"POST".equals(m) && !"PUT".equals(m) && !"PATCH".equals(m) && !"DELETE".equals(m)) {
                return;
            }
            if (request.getRequestURI().startsWith("/api/health")) {
                return;
            }
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return;
            }
            String actor = principalLabel(auth);
            auditService.log(
                    null,
                    m + " " + request.getRequestURI(),
                    "http",
                    null,
                    request.getRemoteAddr(),
                    "principal=" + actor);
        } catch (Exception ignored) {
            // never fail response for audit
        }
    }

    private static String principalLabel(Authentication auth) {
        Object p = auth.getPrincipal();
        if (p instanceof UserDetails ud) {
            return ud.getUsername();
        }
        if (p instanceof OAuth2User ou) {
            Object email = ou.getAttribute("email");
            return email != null ? email.toString() : ou.getName();
        }
        return auth.getName();
    }
}
