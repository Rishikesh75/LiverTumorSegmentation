package com.livertumor.segmentation.bootstrap;

import com.livertumor.segmentation.persistence.AppUser;
import com.livertumor.segmentation.persistence.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class DevUserBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevUserBootstrap.class);

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.dev-login-enabled:false}")
    private boolean devLoginEnabled;

    @Value("${app.auth.dev-email:dev@example.com}")
    private String devEmail;

    @Value("${app.auth.dev-password:changeme}")
    private String devPassword;

    public DevUserBootstrap(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!devLoginEnabled || !StringUtils.hasText(devEmail)) {
            return;
        }
        appUserRepository.findByEmailIgnoreCase(devEmail).ifPresentOrElse(
                u -> log.debug("Dev user already exists: {}", devEmail),
                () -> {
                    AppUser u = AppUser.newLocalUser(devEmail, passwordEncoder.encode(devPassword), devEmail);
                    appUserRepository.save(u);
                    log.info("Seeded dev login user {}", devEmail);
                });
    }
}
