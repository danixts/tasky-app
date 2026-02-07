package com.tasky.app.config.interceptors;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RequestLoggingInterceptor extends OncePerRequestFilter {

    private static final int MAX_BODY_LENGTH = 1000;

    private static final Set<String> EXCLUDED_PATHS = Set.of(
            "/actuator", "/swagger-ui", "/v3/api-docs", "/webjars",
            "/css", "/js", "/images", "/favicon.ico"
    );

    private static final Set<String> SKIPPED_CONTENT_TYPES = Set.of(
            "application/pdf", "text/html", "image/", "application/octet-stream"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        var path = request.getRequestURI();
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        var cachedRequest = new ContentCachingRequestWrapper(request, MAX_BODY_LENGTH);
        var cachedResponse = new ContentCachingResponseWrapper(response);

        var startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(cachedRequest, cachedResponse);
        } finally {
            var duration = System.currentTimeMillis() - startTime;
            logRequest(cachedRequest);
            logResponse(cachedResponse, duration);
            cachedResponse.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request) {
        var method = request.getMethod();
        var uri = request.getRequestURI();
        var query = request.getQueryString();
        var clientIp = getClientIp(request);
        var body = extractBody(request.getContentAsByteArray(), request.getContentType());

        log.info(">>> {} {} {} | IP: {} | Body: {}",
                method, uri, query != null ? "?" + query : "", clientIp, body);
    }

    private void logResponse(ContentCachingResponseWrapper response, long duration) {
        var status = response.getStatus();
        var contentType = response.getContentType();
        var body = extractBody(response.getContentAsByteArray(), contentType);

        log.info("<<< {} | {}ms | Content-Type: {} | Body: {}",
                status, duration, contentType, body);
    }

    private String extractBody(byte[] content, String contentType) {
        if (content == null || content.length == 0) {
            return "[EMPTY]";
        }
        if (contentType != null && SKIPPED_CONTENT_TYPES.stream().anyMatch(contentType::contains)) {
            return "[BINARY]";
        }
        var body = new String(content, StandardCharsets.UTF_8).replaceAll("\\s+", " ").trim();
        return body.length() > MAX_BODY_LENGTH
                ? body.substring(0, MAX_BODY_LENGTH) + "... [TRUNCATED]"
                : body;
    }

    private String getClientIp(HttpServletRequest request) {
        var forwarded = request.getHeader("X-Forwarded-For");
        return forwarded != null ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
    }
}
