package com.tasky.domain.entity.user.service.impl;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.domain.entity.role.RoleEntity;
import com.tasky.domain.entity.user.UserEntity;
import com.tasky.domain.entity.user.dto.ReadUserDto;
import com.tasky.domain.entity.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private UserEntity userEntity;

    @BeforeEach
    void setUp() {
        var role = new RoleEntity();
        role.setCode("USER");

        userEntity = new UserEntity();
        userEntity.setUserId(UUID.randomUUID());
        userEntity.setUsername("testuser");
        userEntity.setEmail("test@test.com");
        userEntity.setPassword("encoded");
        userEntity.setStateUser(true);
        userEntity.setRole(role);
    }

    @Test
    void shouldReturnReadUserDto_whenUserExists() {
        when(userRepository.findByUsernameOrEmailAndStateUser("testuser", "testuser", true))
                .thenReturn(Optional.of(userEntity));

        ReadUserDto result = userService.getUserCredentials("testuser");

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("encoded", result.getPassword());
        assertEquals("USER", result.getCodeRole());
    }

    @Test
    void shouldThrowApiErrorException_whenUserNotFound() {
        when(userRepository.findByUsernameOrEmailAndStateUser("unknown", "unknown", true))
                .thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> userService.getUserCredentials("unknown"));
    }

    @Test
    void shouldReturnUserRoles_whenUserExists() {
        when(userRepository.findByUsernameOrEmailAndStateUser("testuser", "testuser", true))
                .thenReturn(Optional.of(userEntity));

        List<String> result = userService.getUserRoles("testuser");

        assertEquals(1, result.size());
        assertEquals("USER", result.get(0));
    }

    @Test
    void shouldThrowApiErrorException_whenUserNotFoundForRoles() {
        when(userRepository.findByUsernameOrEmailAndStateUser("unknown", "unknown", true))
                .thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> userService.getUserRoles("unknown"));
    }
}
