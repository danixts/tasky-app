package com.tasky.app.config.security.exceptions;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.tasky.common.exception.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;

@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest req,
                         HttpServletResponse res,
                         AuthenticationException e) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        res.setStatus(HttpStatus.UNAUTHORIZED.value());
        res.setContentType("application/json");
        PrintWriter writer = res.getWriter();
        ApiError accessUnauthorized = new ApiError(HttpStatus.UNAUTHORIZED);
        accessUnauthorized.setMessage("UNAUTHORIZED");
        accessUnauthorized.setStatus(HttpStatus.UNAUTHORIZED);
        accessUnauthorized.setData(null);
        accessUnauthorized.setSuccess(false);
        mapper.findAndRegisterModules();
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String json = mapper.writeValueAsString(accessUnauthorized);
        writer.print(json);
        log.warn(e.getMessage());
    }
}