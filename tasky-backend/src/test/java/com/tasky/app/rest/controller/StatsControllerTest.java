package com.tasky.app.rest.controller;

import com.tasky.domain.entity.stats.dto.TaskCountByBoardAndStatusDto;
import com.tasky.domain.entity.stats.dto.TaskCountByStatusDto;
import com.tasky.domain.entity.stats.service.StatsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("StatsController")
class StatsControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    private StatsService statsService;

    private final UUID boardId = UUID.randomUUID();

    @Test
    @WithMockUser
    void shouldReturnSummary_whenGetSummary() throws Exception {
        var dto = TaskCountByStatusDto.builder()
                .statusCode("TODO")
                .statusLabel("To Do")
                .taskCount(5L)
                .build();

        when(statsService.getTasksByStatusForCurrentUser()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/stats/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].statusCode").value("TODO"))
                .andExpect(jsonPath("$.data[0].statusLabel").value("To Do"))
                .andExpect(jsonPath("$.data[0].taskCount").value(5));

        verify(statsService).getTasksByStatusForCurrentUser();
    }

    @Test
    @WithMockUser
    void shouldReturnEmptyList_whenSummaryHasNoData() throws Exception {
        when(statsService.getTasksByStatusForCurrentUser()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/stats/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    @WithMockUser
    void shouldReturnBreakdown_whenGetBreakdown() throws Exception {
        var dto = TaskCountByBoardAndStatusDto.builder()
                .boardId(boardId)
                .boardName("My Board")
                .statusCode("TODO")
                .statusLabel("To Do")
                .taskCount(3L)
                .build();

        when(statsService.getTasksByBoardAndStatusForCurrentUser()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/stats/breakdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].boardId").value(boardId.toString()))
                .andExpect(jsonPath("$.data[0].boardName").value("My Board"))
                .andExpect(jsonPath("$.data[0].statusCode").value("TODO"))
                .andExpect(jsonPath("$.data[0].taskCount").value(3));

        verify(statsService).getTasksByBoardAndStatusForCurrentUser();
    }

    @Test
    @WithMockUser
    void shouldReturnEmptyList_whenBreakdownHasNoData() throws Exception {
        when(statsService.getTasksByBoardAndStatusForCurrentUser()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/stats/breakdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));
    }
}
