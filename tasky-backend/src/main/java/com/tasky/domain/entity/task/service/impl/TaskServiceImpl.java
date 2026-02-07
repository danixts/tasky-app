package com.tasky.domain.entity.task.service.impl;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.board.BoardEntity;
import com.tasky.domain.entity.board.BoardRepository;
import com.tasky.domain.entity.board.BoardStatusEntity;
import com.tasky.domain.entity.board.BoardStatusRepository;
import com.tasky.domain.entity.board.dto.BoardStatusResponse;
import com.tasky.domain.entity.task.TaskEntity;
import com.tasky.domain.entity.task.TaskPriority;
import com.tasky.domain.entity.task.TaskRepository;
import com.tasky.domain.entity.task.TaskStatus;
import com.tasky.domain.entity.task.dto.request.CreateTaskBody;
import com.tasky.domain.entity.task.dto.request.MoveTaskBody;
import com.tasky.domain.entity.task.dto.request.UpdateTaskBody;
import com.tasky.domain.entity.task.dto.response.BoardColumnResponse;
import com.tasky.domain.entity.task.dto.response.TaskBoardResponse;
import com.tasky.domain.entity.task.dto.response.TaskResponse;
import com.tasky.domain.entity.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private static final Map<String, TaskStatus> CODE_TO_STATUS = Map.of(
            "TODO", TaskStatus.PENDING,
            "IN_PROGRESS", TaskStatus.IN_PROGRESS,
            "COMPLETED", TaskStatus.COMPLETED
    );

    private static final Map<TaskStatus, String> STATUS_TO_CODE = Map.of(
            TaskStatus.PENDING, "TODO",
            TaskStatus.IN_PROGRESS, "IN_PROGRESS",
            TaskStatus.COMPLETED, "COMPLETED"
    );

    private final TaskRepository taskRepository;
    private final BoardRepository boardRepository;
    private final BoardStatusRepository boardStatusRepository;
    private final UserContext userContext;

    @Override
    public TaskBoardResponse getBoard(UUID boardId) {
        var board = findBoardOrThrow(boardId);
        var statuses = boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId);
        var tasks = taskRepository.findAllByBoardId(boardId);

        var statusCodeById = statuses.stream()
                .collect(Collectors.toMap(BoardStatusEntity::getStatusId, BoardStatusEntity::getCode));

        var tasksByStatusId = tasks.stream()
                .collect(Collectors.groupingBy(TaskEntity::getStatusId));

        var statusResponses = statuses.stream()
                .map(this::toStatusResponse)
                .toList();

        var columns = statuses.stream()
                .map(s -> BoardColumnResponse.builder()
                        .statusId(s.getStatusId())
                        .tasks(tasksByStatusId.getOrDefault(s.getStatusId(), List.of()).stream()
                                .sorted(Comparator.comparing(TaskEntity::getPosition))
                                .map(t -> toResponse(t, statusCodeById.get(t.getStatusId())))
                                .toList())
                        .build())
                .toList();

        return TaskBoardResponse.builder()
                .boardId(board.getBoardId())
                .boardName(board.getName())
                .statuses(statusResponses)
                .columns(columns)
                .build();
    }

    @Override
    public List<TaskResponse> getTasksByUser() {
        var userId = userContext.getUserId();
        var tasks = taskRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        var statusIds = tasks.stream().map(TaskEntity::getStatusId).distinct().toList();
        var statusCodeById = boardStatusRepository.findAllById(statusIds).stream()
                .collect(Collectors.toMap(BoardStatusEntity::getStatusId, BoardStatusEntity::getCode));
        return tasks.stream()
                .map(t -> toResponse(t, statusCodeById.get(t.getStatusId())))
                .toList();
    }

    @Override
    public List<TaskResponse> getTasksByUserAndStatus(TaskStatus status) {
        return getTasksByUser().stream()
                .filter(t -> t.getStatus() == status)
                .toList();
    }

    @Override
    public TaskResponse getTask(UUID taskId) {
        var task = findTaskOrThrow(taskId);
        var statusCode = boardStatusRepository.findById(task.getStatusId())
                .map(BoardStatusEntity::getCode)
                .orElse("TODO");
        return toResponse(task, statusCode);
    }

    @Override
    @Transactional
    public TaskResponse createTask(CreateTaskBody body) {
        findBoardOrThrow(body.getBoardId());
        var statuses = boardStatusRepository.findAllByBoardIdOrderByPositionAsc(body.getBoardId());
        if (statuses.isEmpty()) {
            throw new ApiErrorException("BOARD HAS NO STATUSES", HttpStatus.BAD_REQUEST, null, false);
        }

        var statusId = Objects.requireNonNullElseGet(body.getStatusId(), () -> statuses.getFirst().getStatusId());

        var validStatus = statuses.stream()
                .filter(s -> s.getStatusId().equals(statusId))
                .findFirst()
                .orElseThrow(() -> new ApiErrorException("INVALID STATUS FOR BOARD", HttpStatus.BAD_REQUEST, null, false));

        var position = taskRepository.findMaxPositionByBoardIdAndStatusId(body.getBoardId(), statusId) + 1;

        var now = LocalDateTime.now();
        var task = new TaskEntity();
        task.setTaskId(UUID.randomUUID());
        task.setTitle(body.getTitle());
        task.setDescription(body.getDescription());
        task.setPriority(Objects.requireNonNullElse(body.getPriority(), TaskPriority.NORMAL));
        task.setUserId(userContext.getUserId());
        task.setBoardId(body.getBoardId());
        task.setStatusId(statusId);
        task.setPosition(position);
        task.setCreatedAt(now);
        task.setUpdatedAt(now);

        return toResponse(taskRepository.save(task), validStatus.getCode());
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UUID taskId, UpdateTaskBody body) {
        var task = findTaskOrThrow(taskId);
        task.setTitle(body.getTitle());
        task.setDescription(body.getDescription());

        var statuses = boardStatusRepository.findAllByBoardIdOrderByPositionAsc(task.getBoardId());
        var statusById = statuses.stream()
                .collect(Collectors.toMap(BoardStatusEntity::getStatusId, s -> s));
        var statusByCode = statuses.stream()
                .collect(Collectors.toMap(BoardStatusEntity::getCode, s -> s, (a, _) -> a));

        if (body.getStatusId() != null && statusById.containsKey(body.getStatusId())) {
            task.setStatusId(body.getStatusId());
        } else if (body.getStatus() != null) {
            var code = STATUS_TO_CODE.getOrDefault(body.getStatus(), "TODO");
            var matched = statusByCode.get(code);
            if (matched != null) {
                task.setStatusId(matched.getStatusId());
            }
        }

        if (body.getPriority() != null) {
            task.setPriority(body.getPriority());
        }

        var saved = taskRepository.save(task);
        var resolvedStatus = statusById.get(saved.getStatusId());
        var statusCode = resolvedStatus != null ? resolvedStatus.getCode() : "TODO";
        return toResponse(saved, statusCode);
    }

    @Override
    @Transactional
    public TaskResponse moveTask(UUID taskId, MoveTaskBody body) {
        var task = findTaskOrThrow(taskId);
        findBoardOrThrow(task.getBoardId());

        var statuses = boardStatusRepository.findAllByBoardIdOrderByPositionAsc(task.getBoardId());
        var statusById = statuses.stream()
                .collect(Collectors.toMap(BoardStatusEntity::getStatusId, s -> s));

        if (!statusById.containsKey(body.getStatusId())) {
            throw new ApiErrorException("INVALID STATUS FOR BOARD", HttpStatus.BAD_REQUEST, null, false);
        }

        task.setStatusId(body.getStatusId());
        task.setPosition(body.getPosition());

        var saved = taskRepository.save(task);
        return toResponse(saved, statusById.get(body.getStatusId()).getCode());
    }

    @Override
    @Transactional
    public void deleteTask(UUID taskId) {
        var task = findTaskOrThrow(taskId);
        taskRepository.delete(task);
    }

    private BoardEntity findBoardOrThrow(UUID boardId) {
        var userId = userContext.getUserId();
        return boardRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new ApiErrorException("BOARD NOT FOUND", HttpStatus.NOT_FOUND, null, false));
    }

    private TaskEntity findTaskOrThrow(UUID taskId) {
        var userId = userContext.getUserId();
        return taskRepository.findByTaskIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ApiErrorException("TASK NOT FOUND", HttpStatus.NOT_FOUND, null, false));
    }

    private BoardStatusResponse toStatusResponse(BoardStatusEntity entity) {
        return BoardStatusResponse.builder()
                .statusId(entity.getStatusId())
                .code(entity.getCode())
                .label(entity.getLabel())
                .position(entity.getPosition())
                .build();
    }

    private TaskResponse toResponse(TaskEntity entity, String statusCode) {
        return TaskResponse.builder()
                .taskId(entity.getTaskId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(CODE_TO_STATUS.getOrDefault(statusCode, TaskStatus.PENDING))
                .priority(entity.getPriority())
                .boardId(entity.getBoardId())
                .statusId(entity.getStatusId())
                .position(entity.getPosition())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
