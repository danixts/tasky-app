package com.tasky.domain.entity.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadUserDto {
    private String username;
    private String password;
    private Boolean stateUser;
    private String codeRole;
    private String userId;
}
