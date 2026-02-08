package com.tasky.domain.entity.stats.service.impl;

import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.stats.StatsRepository;
import com.tasky.domain.entity.stats.projection.TaskCountByBoardAndStatusProjection;
import com.tasky.domain.entity.stats.projection.TaskCountByStatusProjection;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StatsServiceImpl")
class StatsServiceImplTest {

    @Mock
    private StatsRepository statsRepository;

    @Mock
    private UserContext userContext;

    @InjectMocks
    private StatsServiceImpl statsService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        when(userContext.getUserId()).thenReturn(userId);
    }

    @Test
    void shouldReturnTaskCountByStatus_whenGetTasksByStatusForCurrentUser() {
        var projection = mock(TaskCountByStatusProjection.class);
        when(projection.getStatusCode()).thenReturn("TODO");
        when(projection.getStatusLabel()).thenReturn("To Do");
        when(projection.getTaskCount()).thenReturn(5L);

        when(statsRepository.findTaskCountByStatusForUser(userId)).thenReturn(List.of(projection));

        var result = statsService.getTasksByStatusForCurrentUser();

        assertEquals(1, result.size());
        assertEquals("TODO", result.get(0).getStatusCode());
        assertEquals("To Do", result.get(0).getStatusLabel());
        assertEquals(5L, result.get(0).getTaskCount());
        verify(userContext).getUserId();
        verify(statsRepository).findTaskCountByStatusForUser(userId);
    }

    @Test
    void shouldReturnEmptyList_whenNoDataForSummary() {
        when(statsRepository.findTaskCountByStatusForUser(userId)).thenReturn(List.of());

        var result = statsService.getTasksByStatusForCurrentUser();

        assertTrue(result.isEmpty());
        verify(statsRepository).findTaskCountByStatusForUser(userId);
    }

    @Test
    void shouldReturnTaskCountByBoardAndStatus_whenGetTasksByBoardAndStatusForCurrentUser() {
        var boardId = UUID.randomUUID();
        var projection = mock(TaskCountByBoardAndStatusProjection.class);
        when(projection.getBoardId()).thenReturn(boardId);
        when(projection.getBoardName()).thenReturn("Work");
        when(projection.getStatusCode()).thenReturn("IN_PROGRESS");
        when(projection.getStatusLabel()).thenReturn("In Progress");
        when(projection.getTaskCount()).thenReturn(2L);

        when(statsRepository.findTaskCountByBoardAndStatusForUser(userId)).thenReturn(List.of(projection));

        var result = statsService.getTasksByBoardAndStatusForCurrentUser();

        assertEquals(1, result.size());
        assertEquals(boardId, result.get(0).getBoardId());
        assertEquals("Work", result.get(0).getBoardName());
        assertEquals("IN_PROGRESS", result.get(0).getStatusCode());
        assertEquals("In Progress", result.get(0).getStatusLabel());
        assertEquals(2L, result.get(0).getTaskCount());
        verify(userContext).getUserId();
        verify(statsRepository).findTaskCountByBoardAndStatusForUser(userId);
    }

    @Test
    void shouldReturnEmptyList_whenNoDataForBreakdown() {
        when(statsRepository.findTaskCountByBoardAndStatusForUser(userId)).thenReturn(List.of());

        var result = statsService.getTasksByBoardAndStatusForCurrentUser();

        assertTrue(result.isEmpty());
        verify(statsRepository).findTaskCountByBoardAndStatusForUser(userId);
    }
}
