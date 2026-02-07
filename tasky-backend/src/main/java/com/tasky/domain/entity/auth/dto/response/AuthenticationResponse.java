package com.tasky.domain.entity.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthenticationResponse {
    private String token;
    private String tokenType;
    private Integer expiresIn;
    private String refreshToken;
    private String username;
}
