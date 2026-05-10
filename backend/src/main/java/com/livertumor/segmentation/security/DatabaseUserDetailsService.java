package com.livertumor.segmentation.security;

import com.livertumor.segmentation.persistence.AppUser;
import com.livertumor.segmentation.persistence.AppUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    public DatabaseUserDetailsService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser u = appUserRepository
                .findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (!StringUtils.hasText(u.getPasswordHash())) {
            throw new UsernameNotFoundException("No password credentials for user");
        }
        return User.builder()
                .username(u.getEmail())
                .password(u.getPasswordHash())
                .roles(parseRole(u.getRole()))
                .build();
    }

    private static String[] parseRole(String role) {
        if (!StringUtils.hasText(role)) {
            return new String[] {"USER"};
        }
        return new String[] {role.startsWith("ROLE_") ? role.substring("ROLE_".length()) : role};
    }
}
