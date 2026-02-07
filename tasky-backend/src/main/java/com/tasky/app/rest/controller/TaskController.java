package com.tasky.app.rest.controller;

import com.tasky.common.model.ResponseHandler;
import com.tasky.common.model.SuccessResponse;
import com.tasky.domain.entity.task.TaskStatus;
import com.tasky.domain.entity.task.dto.request.CreateTaskBody;
import com.tasky.domain.entity.task.dto.request.MoveTaskBody;
import com.tasky.domain.entity.task.dto.request.UpdateTaskBody;
import com.tasky.domain.entity.task.dto.response.TaskBoardResponse;
import com.tasky.domain.entity.task.dto.response.TaskResponse;
import com.tasky.domain.entity.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.v1}/tasks", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {
    private final TaskService taskService;

    @GetMapping("/board")
    @Operation(summary = "Get board with tasks grouped by status")
    public ResponseEntity<SuccessResponse<TaskBoardResponse>> getBoard(@RequestParam UUID boardId) {
        return ResponseHandler.success(taskService.getBoard(boardId));
    }

    @GetMapping
    @Operation(summary = "List tasks for the authenticated user")
    public ResponseEntity<SuccessResponse<List<TaskResponse>>> getTasks(@RequestParam(required = false) TaskStatus status) {
        var tasks = status != null ? taskService.getTasksByUserAndStatus(status) : taskService.getTasksByUser();
        return ResponseHandler.success(tasks);
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get a task by ID")
    public ResponseEntity<SuccessResponse<TaskResponse>> getTask(@PathVariable UUID taskId) {
        return ResponseHandler.success(taskService.getTask(taskId));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<SuccessResponse<TaskResponse>> createTask(@RequestBody @Valid CreateTaskBody body) {
        return ResponseHandler.success(taskService.createTask(body), "TASK CREATED");
    }

    @PutMapping("/{taskId}")
    @Operation(summary = "Update an existing task")
    public ResponseEntity<SuccessResponse<TaskResponse>> updateTask(@PathVariable UUID taskId, @RequestBody @Valid UpdateTaskBody body) {
        return ResponseHandler.success(taskService.updateTask(taskId, body), "TASK UPDATED");
    }

    @PatchMapping("/{taskId}/move")
    @Operation(summary = "Move a task to a different status/position (drag & drop)")
    public ResponseEntity<SuccessResponse<TaskResponse>> moveTask(@PathVariable UUID taskId, @RequestBody @Valid MoveTaskBody body) {
        return ResponseHandler.success(taskService.moveTask(taskId, body), "TASK MOVED");
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<SuccessResponse<Void>> deleteTask(@PathVariable UUID taskId) {
        taskService.deleteTask(taskId);
        return ResponseHandler.success(null, "TASK DELETED");
    }
}
