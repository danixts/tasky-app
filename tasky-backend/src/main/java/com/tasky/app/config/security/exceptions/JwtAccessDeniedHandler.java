package com.tasky.app.config.security.exceptions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.tasky.common.exception.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;
import java.io.PrintWriter;

public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(403);
        ObjectMapper mapper = new ObjectMapper();
        PrintWriter writer = response.getWriter();
        ApiError accessDenied = new ApiError(HttpStatus.UNAUTHORIZED);
        accessDenied.setMessage("UNAUTHORIZED");
        accessDenied.setStatus(HttpStatus.UNAUTHORIZED);
        accessDenied.setData(null);
        accessDenied.setSuccess(false);
        mapper.findAndRegisterModules();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        writer.print(mapper.writeValueAsString(accessDenied));
    }
}
