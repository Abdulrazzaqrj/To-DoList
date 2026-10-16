package com.taskmanager.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI taskManagerOpenApi() {
        return new OpenAPI().info(new Info()
                .title("To-Do Task Manager API")
                .version("1.0.0")
                .description("REST API for creating, searching, filtering and tracking tasks."));
    }
}
