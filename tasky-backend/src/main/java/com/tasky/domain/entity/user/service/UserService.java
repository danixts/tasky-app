package com.tasky.domain.entity.user.service;

import com.tasky.domain.entity.user.dto.ReadUserDto;

import java.util.List;

public interface UserService {
    ReadUserDto getUserCredentials(String username);

    List<String> getUserRoles(String username);

    ReadUserDto getCredentialsWithRole(String username);
}
