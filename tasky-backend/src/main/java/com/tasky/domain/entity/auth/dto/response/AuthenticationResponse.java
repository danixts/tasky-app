package com.tasky.domain.entity.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class AuthenticationResponse {
    private String token;
    private String tokenType;
    private Long expiresIn;
    private String refreshToken;
    private String username;
    private List<BoardInfo> boards;

    @Getter
    @Builder
    public static class BoardInfo {
        private UUID boardId;
        private String name;
    }
}
