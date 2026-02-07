package com.tasky.common.utils;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.domain.entity.role.RoleEntity;
import com.tasky.domain.entity.user.UserEntity;
import com.tasky.domain.entity.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserContext")
class UserContextTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserContext userContext;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USERNAME = "testuser";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldReturnUsername_whenUserIsAuthenticated() {
        var auth = new UsernamePasswordAuthenticationToken(USERNAME, "pass");
        SecurityContextHolder.getContext().setAuthentication(auth);

        String result = userContext.getUsername();

        assertEquals(USERNAME, result);
    }

    @Test
    void shouldThrowApiErrorException_whenNotAuthenticated() {
        assertThrows(ApiErrorException.class, () -> userContext.getUsername());
    }

    @Test
    void shouldThrowApiErrorException_whenPrincipalIsNull() {
        var auth = new UsernamePasswordAuthenticationToken(null, "pass");
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThrows(ApiErrorException.class, () -> userContext.getUsername());
    }

    @Test
    void shouldReturnUserId_whenUserIsFound() {
        var auth = new UsernamePasswordAuthenticationToken(USERNAME, "pass");
        SecurityContextHolder.getContext().setAuthentication(auth);

        var user = createUserEntity();
        when(userRepository.findByUsernameAndStateUser(USERNAME, true)).thenReturn(Optional.of(user));

        UUID result = userContext.getUserId();

        assertEquals(USER_ID, result);
    }

    @Test
    void shouldReturnUserEntity_whenUserExists() {
        var auth = new UsernamePasswordAuthenticationToken(USERNAME, "pass");
        SecurityContextHolder.getContext().setAuthentication(auth);

        var user = createUserEntity();
        when(userRepository.findByUsernameAndStateUser(USERNAME, true)).thenReturn(Optional.of(user));

        UserEntity result = userContext.getAuthenticatedUser();

        assertEquals(user, result);
    }

    @Test
    void shouldThrowApiErrorException_whenUserNotFound() {
        var auth = new UsernamePasswordAuthenticationToken(USERNAME, "pass");
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByUsernameAndStateUser(USERNAME, true)).thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> userContext.getAuthenticatedUser());
    }

    private UserEntity createUserEntity() {
        var user = new UserEntity();
        user.setUserId(USER_ID);
        user.setUsername(USERNAME);
        user.setRole(new RoleEntity());
        return user;
    }
}
