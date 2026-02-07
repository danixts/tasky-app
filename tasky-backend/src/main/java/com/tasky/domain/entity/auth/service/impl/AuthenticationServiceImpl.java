package com.tasky.domain.entity.auth.service.impl;


import com.tasky.app.config.security.jwt.JwtToken;
import com.tasky.common.exception.ApiErrorException;
import com.tasky.domain.entity.auth.dto.request.AuthenticationRequest;
import com.tasky.domain.entity.auth.dto.request.RefreshTokenRequest;
import com.tasky.domain.entity.auth.dto.response.AuthenticationResponse;
import com.tasky.domain.entity.auth.service.AuthenticationService;
import com.tasky.domain.entity.token.TokenEntity;
import com.tasky.domain.entity.token.TokenRepository;
import com.tasky.domain.entity.token.TokenType;
import com.tasky.domain.entity.user.UserEntity;
import com.tasky.domain.entity.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JwtToken jwtService;
    private final AuthenticationManager authenticationManager;
    private static final String USER_NOT_FOUND = "USER NOT FOUND";

    public AuthenticationServiceImpl(TokenRepository tokenRepository,
                                     UserRepository userRepository,
                                     JwtToken jwtService,
                                     AuthenticationManager authenticationManager) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    @Transactional
    public AuthenticationResponse login(AuthenticationRequest request) {

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
        ));

        UserEntity user = userRepository.findByUsernameAndStateUser(authentication.getName(), true).orElseThrow(
                () -> new ApiErrorException(USER_NOT_FOUND)
        );

        UserDetails userDetailService = (UserDetails) authentication.getPrincipal();
        String accessToken = jwtService.generateAccessToken(userDetailService);
        String refreshToken = jwtService.generateRefreshToken(userDetailService);

        this.revokeUserToken(user, Arrays.asList(TokenType.ACCESS_TOKEN, TokenType.REFRESH_TOKEN));
        this.saveUserToken(user, accessToken, TokenType.ACCESS_TOKEN);
        this.saveUserToken(user, refreshToken, TokenType.REFRESH_TOKEN);

        return AuthenticationResponse.builder()
                .token(accessToken)
                .username(user.getUsername())
                .refreshToken(refreshToken)
                .tokenType("token")
                .expiresIn(1)
                .build();
    }

    @Override
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        Jws<Claims> claimsJws = jwtService.validateToken(refreshToken);

        Claims body = claimsJws.getPayload();
        String username = (String) body.get("username");
        UserEntity user = userRepository.findByUsernameAndStateUser(username, true).orElseThrow(
                () -> new ApiErrorException(USER_NOT_FOUND)
        );

        String authorities = (String) body.get("authorities");
        List<GrantedAuthority> grantedAuthorities =
            authorities != null ? 
            Arrays.stream(authorities.split(" "))
                  .map(SimpleGrantedAuthority::new)
                  .collect(Collectors.toList()) :
            new ArrayList<>();
            
        UserDetails userDetailService = User.builder()
                .username(username)
                .password("")
                .authorities(grantedAuthorities)
                .build();
        String accessToken = jwtService.generateAccessToken(userDetailService);

        this.revokeUserToken(user, List.of(TokenType.ACCESS_TOKEN));
        this.saveUserToken(user, accessToken, TokenType.ACCESS_TOKEN);

        return AuthenticationResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("token")
                .expiresIn(1)
                .build();
    }

    @Override
    @Transactional
    public void logout(String username) {
        UserEntity user = userRepository.findByUsernameAndStateUser(username, true).orElseThrow(
                () -> new ApiErrorException(USER_NOT_FOUND)
        );
        this.revokeUserToken(user, Arrays.asList(TokenType.ACCESS_TOKEN, TokenType.REFRESH_TOKEN));
    }

    public void revokeUserToken(UserEntity user, List<TokenType> tokenTypes) {
        tokenTypes.forEach(tt -> {
            Optional<TokenEntity> token = tokenRepository.findAllByUserUserIdAndRevokedIsFalseAndTokenType(user.getUserId(), tt);
            token.ifPresent(t -> {
                t.setRevoked(true);
                tokenRepository.save(t);
            });
        });
    }

    private void saveUserToken(UserEntity user, String tokenRequest, TokenType tokenType) {
        TokenEntity token = new TokenEntity();
        token.setToken(tokenRequest);
        token.setUser(user);
        token.setRevoked(false);
        token.setTokenType(tokenType);
        tokenRepository.save(token);
    }
}
