package com.tasky.app.config.security;


import com.tasky.app.config.security.exceptions.ExceptionHandlerFilter;
import com.tasky.app.config.security.exceptions.JwtAccessDeniedHandler;
import com.tasky.app.config.security.exceptions.JwtAuthenticationEntryPoint;
import com.tasky.app.config.security.jwt.JwtRequestFilter;
import com.tasky.app.config.security.jwt.JwtUserDetails;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final ExceptionHandlerFilter exceptionHandlerFilter;
    private final JwtRequestFilter jwtRequestFilter;
    private final JwtUserDetails jwtUserDetails;

    public SecurityConfig(ExceptionHandlerFilter exceptionHandlerFilter,
                          JwtRequestFilter jwtRequestFilter,
                          @Qualifier("jwtUserDetailsService") JwtUserDetails jwtUserDetails) {
        this.exceptionHandlerFilter = exceptionHandlerFilter;
        this.jwtRequestFilter = jwtRequestFilter;
        this.jwtUserDetails = jwtUserDetails;
    }

    private static final String[] AUTH_WHITELIST = {
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/docs",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/v3/api-docs",
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.csrf(AbstractHttpConfigurer::disable);
        http.addFilterBefore(exceptionHandlerFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        http.authorizeHttpRequests(authHttp -> authHttp
                .requestMatchers(AUTH_WHITELIST).permitAll()
                .anyRequest().authenticated()
        );
        http.userDetailsService(jwtUserDetails);
        http.exceptionHandling(exception -> {
            exception.authenticationEntryPoint(new JwtAuthenticationEntryPoint());
            exception.accessDeniedHandler(new JwtAccessDeniedHandler());
        });
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "https://tasky.danyjs.com",
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        config.addAllowedHeader("*");
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        config.setMaxAge(3600L);
        config.setAllowedOriginPatterns(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

}
