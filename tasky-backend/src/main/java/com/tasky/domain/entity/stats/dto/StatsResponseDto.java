package com.tasky.domain.entity.stats.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StatsResponseDto {

    private List<TaskCountByStatusDto> summary;
    private List<TaskCountByBoardAndStatusDto> breakdown;
}
