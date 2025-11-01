package com.resumescreener.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${FRONTEND_URL:*}")
    private String frontendUrl; // comma separated allowed origins or '*' for fallback

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = frontendUrl.split(",");
        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
