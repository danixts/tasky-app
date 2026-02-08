package com.tasky.domain.entity.stats.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskCountByStatusDto {
    private String statusCode;
    private String statusLabel;
    private long taskCount;
}
