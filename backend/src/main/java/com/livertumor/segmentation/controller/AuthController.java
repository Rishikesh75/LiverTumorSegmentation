package com.livertumor.segmentation.controller;

import com.livertumor.segmentation.service.UserProvisioningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Session cookie auth (dev login and OAuth2 in browser)")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserProvisioningService userProvisioningService;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();
    private final SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();

    public AuthController(
            AuthenticationManager authenticationManager, UserProvisioningService userProvisioningService) {
        this.authenticationManager = authenticationManager;
        this.userProvisioningService = userProvisioningService;
    }

    public record LoginRequest(String email, String password) {}

    public record UserDto(String id, String email, String displayName, String organization) {}

    public record SessionResponse(UserDto user, String token) {}

    @GetMapping("/me")
    @Operation(summary = "Get current session")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authenticated session"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<SessionResponse> me(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(sessionFrom(authentication));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Uses persisted dev user when app.auth.dev-login-enabled is true.")
    @ApiResponses(@ApiResponse(responseCode = "200", description = "Session established; JSESSIONID cookie set"))
    public ResponseEntity<SessionResponse> login(
            @RequestBody LoginRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        UsernamePasswordAuthenticationToken token =
                UsernamePasswordAuthenticationToken.unauthenticated(body.email(), body.password());
        Authentication auth = authenticationManager.authenticate(token);
        securityContextHolderStrategy.getContext().setAuthentication(auth);
        securityContextRepository.saveContext(securityContextHolderStrategy.getContext(), request, response);
        return ResponseEntity.ok(sessionFrom(auth));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Clears server session and security context.")
    @ApiResponses(@ApiResponse(responseCode = "204", description = "Logged out"))
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = securityContextHolderStrategy.getContext().getAuthentication();
        if (auth != null) {
            logoutHandler.logout(request, response, auth);
        }
        return ResponseEntity.noContent().build();
    }

    private SessionResponse sessionFrom(Authentication authentication) {
        var u = userProvisioningService.ensurePersisted(authentication);
        return new SessionResponse(
                new UserDto(u.getId(), u.getEmail(), u.getDisplayName(), u.getOrganization()), "cookie");
    }
}
