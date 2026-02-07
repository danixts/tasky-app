package com.tasky.app.rest.controller;

import com.tasky.common.model.ResponseHandler;
import com.tasky.common.model.SuccessResponse;
import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.auth.dto.request.AuthenticationRequest;
import com.tasky.domain.entity.auth.dto.request.RefreshTokenRequest;
import com.tasky.domain.entity.auth.dto.response.AuthenticationResponse;
import com.tasky.domain.entity.auth.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "${api.v1}/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserContext userContext;

    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public ResponseEntity<SuccessResponse<AuthenticationResponse>> login(
            @RequestBody @Valid AuthenticationRequest request) {
        return ResponseHandler.success(authenticationService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using a valid refresh token")
    public ResponseEntity<SuccessResponse<AuthenticationResponse>> refreshToken(
            @RequestBody @Valid RefreshTokenRequest request) {
        return ResponseHandler.success(authenticationService.refreshToken(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke all tokens")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<SuccessResponse<Void>> logout() {
        authenticationService.logout(userContext.getUsername());
        return ResponseHandler.success(null, "LOGOUT SUCCESSFUL");
    }
}
