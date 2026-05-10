package com.livertumor.segmentation.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "organization")
    private String organization;

    @Column(name = "google_sub")
    private String googleSub;

    @Column(name = "role", nullable = false, length = 32)
    private String role = "USER";

    @Column(name = "org_scope")
    private String orgScope;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AppUser() {
    }

    public AppUser(String id, String email, String passwordHash, String displayName, String organization,
                   String googleSub, String role, String orgScope, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.organization = organization;
        this.googleSub = googleSub;
        this.role = role;
        this.orgScope = orgScope;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static AppUser newLocalUser(String email, String encodedPassword, String displayName) {
        Instant now = Instant.now();
        String id = UUID.randomUUID().toString();
        return new AppUser(id, email, encodedPassword, displayName, null, null, "USER", null, now, now);
    }

    public static AppUser newOAuthUser(String email, String displayName, String googleSub) {
        Instant now = Instant.now();
        String id = UUID.randomUUID().toString();
        return new AppUser(id, email, null, displayName, null, googleSub, "USER", null, now, now);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getGoogleSub() {
        return googleSub;
    }

    public void setGoogleSub(String googleSub) {
        this.googleSub = googleSub;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getOrgScope() {
        return orgScope;
    }

    public void setOrgScope(String orgScope) {
        this.orgScope = orgScope;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
