package com.tasky.common.utils;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.domain.entity.user.UserEntity;
import com.tasky.domain.entity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserContext {

    private final UserRepository userRepository;

    public String getUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ApiErrorException("USER NOT AUTHENTICATED", HttpStatus.UNAUTHORIZED, null, false);
        }
        return (String) authentication.getPrincipal();
    }

    public UUID getUserId() {
        return getAuthenticatedUser().getUserId();
    }

    public UserEntity getAuthenticatedUser() {
        return userRepository.findByUsernameAndStateUser(getUsername(), true)
                .orElseThrow(() -> new ApiErrorException("USER NOT FOUND", HttpStatus.UNAUTHORIZED, null, false));
    }
}
