package com.tasky.domain.entity.task.service.impl;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.task.TaskEntity;
import com.tasky.domain.entity.task.TaskRepository;
import com.tasky.domain.entity.task.TaskStatus;
import com.tasky.domain.entity.task.dto.request.CreateTaskRequest;
import com.tasky.domain.entity.task.dto.request.UpdateTaskRequest;
import com.tasky.domain.entity.task.dto.response.TaskBoardResponse;
import com.tasky.domain.entity.task.dto.response.TaskResponse;
import com.tasky.domain.entity.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserContext userContext;

    @Override
    public TaskBoardResponse getBoard() {
        try {
            var userId = userContext.getUserId();
            var tasks = taskRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
            var grouped = tasks.stream()
                    .map(this::toResponse)
                    .collect(Collectors.groupingBy(TaskResponse::getStatus));
            return TaskBoardResponse.builder()
                    .pending(grouped.getOrDefault(TaskStatus.PENDING, List.of()))
                    .inProgress(grouped.getOrDefault(TaskStatus.IN_PROGRESS, List.of()))
                    .completed(grouped.getOrDefault(TaskStatus.COMPLETED, List.of()))
                    .build();
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving board: {}", e.getMessage(), e);
            throw new ApiErrorException("ERROR RETRIEVING BOARD", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    @Override
    public List<TaskResponse> getTasksByUser() {
        try {
            var userId = userContext.getUserId();
            return taskRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .map(this::toResponse)
                    .toList();
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving tasks: {}", e.getMessage(), e);
            throw new ApiErrorException("ERROR RETRIEVING TASKS", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    @Override
    public List<TaskResponse> getTasksByUserAndStatus(TaskStatus status) {
        try {
            var userId = userContext.getUserId();
            return taskRepository.findAllByUserIdAndStatusOrderByCreatedAtDesc(userId, status)
                    .stream()
                    .map(this::toResponse)
                    .toList();
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving tasks with status {}: {}", status, e.getMessage(), e);
            throw new ApiErrorException("ERROR RETRIEVING TASKS", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    @Override
    public TaskResponse getTask(UUID taskId) {
        try {
            return toResponse(findTaskOrThrow(taskId));
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving task {}: {}", taskId, e.getMessage(), e);
            throw new ApiErrorException("ERROR RETRIEVING TASK", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    @Override
    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        try {
            var userId = userContext.getUserId();
            var now = LocalDateTime.now();
            var task = new TaskEntity();
            task.setTaskId(UUID.randomUUID());
            task.setTitle(request.getTitle());
            task.setDescription(request.getDescription());
            task.setStatus(request.getStatus());
            task.setUserId(userId);
            task.setCreatedAt(now);
            task.setUpdatedAt(now);
            return toResponse(taskRepository.save(task));
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating task: {}", e.getMessage(), e);
            throw new ApiErrorException("ERROR CREATING TASK", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UUID taskId, UpdateTaskRequest request) {
        try {
            var task = findTaskOrThrow(taskId);
            task.setTitle(request.getTitle());
            task.setDescription(request.getDescription());
            task.setStatus(request.getStatus());
            return toResponse(taskRepository.save(task));
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating task {}: {}", taskId, e.getMessage(), e);
            throw new ApiErrorException("ERROR UPDATING TASK", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    @Override
    @Transactional
    public TaskResponse moveTask(UUID taskId, TaskStatus status) {
        try {
            var task = findTaskOrThrow(taskId);
            task.setStatus(status);
            return toResponse(taskRepository.save(task));
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error moving task {} to status {}: {}", taskId, status, e.getMessage(), e);
            throw new ApiErrorException("ERROR MOVING TASK", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    @Override
    @Transactional
    public void deleteTask(UUID taskId) {
        try {
            var task = findTaskOrThrow(taskId);
            taskRepository.delete(task);
        } catch (ApiErrorException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting task {}: {}", taskId, e.getMessage(), e);
            throw new ApiErrorException("ERROR DELETING TASK", HttpStatus.INTERNAL_SERVER_ERROR, null, false);
        }
    }

    private TaskEntity findTaskOrThrow(UUID taskId) {
        var userId = userContext.getUserId();
        return taskRepository.findByTaskIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ApiErrorException("TASK NOT FOUND", HttpStatus.NOT_FOUND, null, false));
    }

    private TaskResponse toResponse(TaskEntity entity) {
        return TaskResponse.builder()
                .taskId(entity.getTaskId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
