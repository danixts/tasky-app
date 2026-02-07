package com.tasky.domain.entity.user.service.impl;


import com.tasky.common.exception.ApiErrorException;
import com.tasky.domain.entity.user.UserEntity;
import com.tasky.domain.entity.user.dto.ReadUserDto;
import com.tasky.domain.entity.user.repository.UserRepository;
import com.tasky.domain.entity.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private UserEntity findByUser(String username) {
        return userRepository.findByUsernameOrEmailAndStateUser(username, username, true)
                .orElseThrow(
                        () -> new ApiErrorException("USER NOT FOUND", HttpStatus.NOT_FOUND, null, false)
                );
    }

    @Override
    public ReadUserDto getUserCredentials(String username) {
        UserEntity user = findByUser(username);

        return ReadUserDto.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .stateUser(user.getStateUser())
                .codeRole(user.getRole().getCode())
                .userId(user.getUserId().toString())
                .build();
    }

    @Override
    public List<String> getUserRoles(String username) {
        var user = findByUser(username);
        return List.of(user.getRole().getCode());
    }
}
