package com.livertumor.segmentation.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    /** Name referenced by {@code @SecurityRequirement} on protected operations. */
    public static final String SESSION_COOKIE = "sessionCookie";

    @Bean
    OpenAPI liverTumorOpenAPI() {
        return new OpenAPI()
                // Relative server avoids wrong absolute URLs in Swagger "Try it out" (fixes some "Failed to fetch").
                .servers(List.of(new Server().url("/").description("Current host")))
                .info(new Info()
                        .title("Liver Tumor Segmentation API")
                        .description(
                                "REST API for liver tumor segmentation, session-based auth, and health checks. "
                                        + "Authenticate with POST /api/auth/login (dev credentials when enabled); "
                                        + "the server sets a JSESSIONID cookie used for subsequent requests.")
                        .version("1.0.0"))
                .components(new Components()
                        .addSecuritySchemes(
                                SESSION_COOKIE,
                                new SecurityScheme()
                                        .name("JSESSIONID")
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .description(
                                                "HTTP session cookie returned after successful POST /api/auth/login. "
                                                        + "In Swagger UI, use Authorize and paste the cookie value if "
                                                        + "Try it out does not attach it automatically.")));
    }
}
