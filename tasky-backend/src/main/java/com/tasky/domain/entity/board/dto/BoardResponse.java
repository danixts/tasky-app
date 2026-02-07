package com.tasky.domain.entity.board.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class BoardResponse {
    private UUID boardId;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
