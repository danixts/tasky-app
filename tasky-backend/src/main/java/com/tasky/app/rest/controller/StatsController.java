package com.tasky.app.rest.controller;

import com.tasky.common.model.ResponseHandler;
import com.tasky.common.model.SuccessResponse;
import com.tasky.domain.entity.stats.dto.TaskCountByBoardAndStatusDto;
import com.tasky.domain.entity.stats.dto.TaskCountByStatusDto;
import com.tasky.domain.entity.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "${api.v1}/stats", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Stats", description = "Task statistics endpoints")
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/summary")
    @Operation(summary = "Task count aggregated by status for current user")
    public ResponseEntity<SuccessResponse<List<TaskCountByStatusDto>>> getSummary() {
        return ResponseHandler.success(statsService.getTasksByStatusForCurrentUser());
    }

    @GetMapping("/breakdown")
    @Operation(summary = "Task count by board and status for current user")
    public ResponseEntity<SuccessResponse<List<TaskCountByBoardAndStatusDto>>> getBreakdown() {
        return ResponseHandler.success(statsService.getTasksByBoardAndStatusForCurrentUser());
    }
}
