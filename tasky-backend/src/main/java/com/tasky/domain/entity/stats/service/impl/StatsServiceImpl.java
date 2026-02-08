package com.tasky.domain.entity.stats.service.impl;

import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.stats.StatsRepository;
import com.tasky.domain.entity.stats.dto.TaskCountByBoardAndStatusDto;
import com.tasky.domain.entity.stats.dto.TaskCountByStatusDto;
import com.tasky.domain.entity.stats.projection.TaskCountByBoardAndStatusProjection;
import com.tasky.domain.entity.stats.projection.TaskCountByStatusProjection;
import com.tasky.domain.entity.stats.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final StatsRepository statsRepository;
    private final UserContext userContext;

    @Override
    public List<TaskCountByStatusDto> getTasksByStatusForCurrentUser() {
        UUID userId = userContext.getUserId();
        return statsRepository.findTaskCountByStatusForUser(userId).stream()
                .map(p -> TaskCountByStatusDto.builder()
                        .statusCode(p.getStatusCode())
                        .statusLabel(p.getStatusLabel())
                        .taskCount(p.getTaskCount())
                        .build())
                .toList();
    }

    @Override
    public List<TaskCountByBoardAndStatusDto> getTasksByBoardAndStatusForCurrentUser() {
        UUID userId = userContext.getUserId();
        return statsRepository.findTaskCountByBoardAndStatusForUser(userId).stream()
                .map(p -> TaskCountByBoardAndStatusDto.builder()
                        .boardId(p.getBoardId())
                        .boardName(p.getBoardName())
                        .statusCode(p.getStatusCode())
                        .statusLabel(p.getStatusLabel())
                        .taskCount(p.getTaskCount())
                        .build())
                .toList();
    }
}
