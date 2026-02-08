package com.tasky.domain.entity.stats.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class TaskCountByBoardAndStatusDto {
    private UUID boardId;
    private String boardName;
    private String statusCode;
    private String statusLabel;
    private long taskCount;
}
