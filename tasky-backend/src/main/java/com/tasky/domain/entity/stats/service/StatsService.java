package com.tasky.domain.entity.stats.service;

import com.tasky.domain.entity.stats.dto.StatsResponseDto;
import com.tasky.domain.entity.stats.dto.TaskCountByBoardAndStatusDto;
import com.tasky.domain.entity.stats.dto.TaskCountByStatusDto;

import java.util.List;

public interface StatsService {

    List<TaskCountByStatusDto> getTasksByStatusForCurrentUser();

    List<TaskCountByBoardAndStatusDto> getTasksByBoardAndStatusForCurrentUser();

    StatsResponseDto getStatsForCurrentUser();
}
