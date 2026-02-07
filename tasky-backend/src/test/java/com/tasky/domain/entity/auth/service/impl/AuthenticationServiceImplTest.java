package com.tasky.domain.entity.auth.service.impl;

import com.tasky.app.config.security.jwt.JwtToken;
import com.tasky.common.exception.ApiErrorException;
import com.tasky.domain.entity.auth.dto.request.AuthenticationRequest;
import com.tasky.domain.entity.auth.dto.request.RegisterRequest;
import com.tasky.domain.entity.auth.dto.response.AuthenticationResponse;
import com.tasky.domain.entity.board.BoardRepository;
import com.tasky.domain.entity.role.RoleEntity;
import com.tasky.domain.entity.role.RoleRepository;
import com.tasky.domain.entity.token.TokenRepository;
import com.tasky.domain.entity.token.TokenType;
import com.tasky.domain.entity.user.UserEntity;
import com.tasky.domain.entity.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationServiceImpl")
class AuthenticationServiceImplTest {

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private JwtToken jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private RoleEntity roleUser;
    private UserEntity userEntity;

    @BeforeEach
    void setUp() {
        roleUser = new RoleEntity();
        roleUser.setCode("USER");

        userEntity = new UserEntity();
        userEntity.setUserId(UUID.randomUUID());
        userEntity.setUsername("testuser");
        userEntity.setEmail("test@test.com");
        userEntity.setPassword("encoded");
        userEntity.setRole(roleUser);
    }

    @Test
    void shouldThrowApiErrorException_whenUsernameAlreadyExists() {
        var request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("new@test.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(ApiErrorException.class, () -> authenticationService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldThrowApiErrorException_whenEmailAlreadyExists() {
        var request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("test@test.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        assertThrows(ApiErrorException.class, () -> authenticationService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldThrowApiErrorException_whenRoleNotFound() {
        var request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@test.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(roleRepository.findByCode("USER")).thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> authenticationService.register(request));
    }

    @Test
    void shouldRegisterAndReturnResponse_whenValidDataProvided() {
        var request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@test.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(roleRepository.findByCode("USER")).thenReturn(Optional.of(roleUser));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateAccessToken(any(UserDetails.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(UserDetails.class))).thenReturn("refreshToken");
        when(jwtService.getExpireTimeToken()).thenReturn(3600L);
        when(boardRepository.findAllByUserIdOrderByCreatedAtAsc(any())).thenReturn(List.of());

        AuthenticationResponse response = authenticationService.register(request);

        assertNotNull(response);
        assertEquals("accessToken", response.getToken());
        assertEquals("refreshToken", response.getRefreshToken());
        assertEquals("newuser", response.getUsername());
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    void shouldThrowApiErrorException_whenInvalidCredentials() {
        var request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("wrong");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid"));

        assertThrows(ApiErrorException.class, () -> authenticationService.login(request));
    }

    @Test
    void shouldThrowApiErrorException_whenUserNotFoundAfterLogin() {
        var request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        var auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("testuser");
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByUsernameAndStateUser("testuser", true)).thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> authenticationService.login(request));
    }

    @Test
    void shouldReturnResponse_whenValidCredentialsProvided() {
        var request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        var auth = mock(Authentication.class);
        var userDetails = User.builder().username("testuser").password("").authorities(List.of()).build();
        when(auth.getName()).thenReturn("testuser");
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByUsernameAndStateUser("testuser", true)).thenReturn(Optional.of(userEntity));
        when(jwtService.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtService.getExpireTimeToken()).thenReturn(3600L);
        when(boardRepository.findAllByUserIdOrderByCreatedAtAsc(any())).thenReturn(List.of());

        AuthenticationResponse response = authenticationService.login(request);

        assertNotNull(response);
        assertEquals("accessToken", response.getToken());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void shouldRevokeTokens_whenLogoutWithValidUser() {
        when(userRepository.findByUsernameAndStateUser("testuser", true)).thenReturn(Optional.of(userEntity));

        authenticationService.logout("testuser");

        verify(tokenRepository, atLeast(1)).findAllByUserUserIdAndRevokedIsFalseAndTokenType(any(), any(TokenType.class));
    }

    @Test
    void shouldThrowApiErrorException_whenLogoutWithUnknownUser() {
        when(userRepository.findByUsernameAndStateUser("unknown", true)).thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> authenticationService.logout("unknown"));
    }
}
