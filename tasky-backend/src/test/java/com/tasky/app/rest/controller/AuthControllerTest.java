package com.tasky.app.rest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.auth.dto.request.AuthenticationRequest;
import com.tasky.domain.entity.auth.dto.request.RefreshTokenRequest;
import com.tasky.domain.entity.auth.dto.request.RegisterRequest;
import com.tasky.domain.entity.auth.dto.response.AuthenticationResponse;
import com.tasky.domain.entity.auth.service.AuthenticationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("AuthController")
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthenticationService authenticationService;

    @MockitoBean
    private UserContext userContext;

    @Test
    void shouldReturn201_whenRegisterWithValidData() throws Exception {
        var request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@test.com");
        request.setPassword("password123");

        var response = AuthenticationResponse.builder()
                .token("jwt-token")
                .username("newuser")
                .refreshToken("refresh")
                .tokenType("token")
                .expiresIn(3600L)
                .build();

        when(authenticationService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("newuser"))
                .andExpect(jsonPath("$.data.token").value("jwt-token"));
    }

    @Test
    void shouldReturn200_whenLoginWithValidCredentials() throws Exception {
        var request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        var response = AuthenticationResponse.builder()
                .token("jwt-token")
                .username("testuser")
                .refreshToken("refresh")
                .tokenType("token")
                .expiresIn(3600L)
                .build();

        when(authenticationService.login(any(AuthenticationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    void shouldReturnNewAccessToken_whenRefreshTokenWithValidToken() throws Exception {
        var request = new RefreshTokenRequest();
        request.setRefreshToken("valid-refresh-token");

        var response = AuthenticationResponse.builder()
                .token("new-access-token")
                .refreshToken("valid-refresh-token")
                .tokenType("token")
                .expiresIn(3600L)
                .build();

        when(authenticationService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").value("new-access-token"));
    }

    @Test
    void shouldReturn200_whenLogoutWithAuthenticatedUser() throws Exception {
        when(userContext.getUsername()).thenReturn("testuser");

        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("LOGOUT SUCCESSFUL"));
    }
}
