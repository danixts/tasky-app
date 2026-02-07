package com.tasky.domain.entity.auth.service;


import com.tasky.domain.entity.auth.dto.request.AuthenticationRequest;
import com.tasky.domain.entity.auth.dto.request.RefreshTokenRequest;
import com.tasky.domain.entity.auth.dto.request.RegisterRequest;
import com.tasky.domain.entity.auth.dto.response.AuthenticationResponse;

public interface AuthenticationService {
    AuthenticationResponse register(RegisterRequest request);

    AuthenticationResponse login(AuthenticationRequest request);

    AuthenticationResponse refreshToken(RefreshTokenRequest request);

    void logout(String username);
}
