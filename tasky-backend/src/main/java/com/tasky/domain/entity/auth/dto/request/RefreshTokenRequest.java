package com.tasky.domain.entity.auth.dto.request;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshTokenRequest {
    @NotEmpty
    @NotNull(message = "Refresh token is required")
    private String refreshToken;
}