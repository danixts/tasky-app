package com.tasky.app.config.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${app.base-url:http://localhost:9000}")
    private String baseUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(new Server().url(baseUrl).description("API Server")))
                .info(new Info()
                        .title("Tasky API")
                        .version("1.0.0")
                        .description("API for task management - Mini Trello"))
                .tags(List.of(
                        new Tag().name("Auth").description("Authentication endpoints"),
                        new Tag().name("Tasks").description("Task management endpoints (CRUD + Board)")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("Authorization")
                                        .description("JWT token with prefix 'Token'. Example: Token eyJhbGci...")));
    }
}
