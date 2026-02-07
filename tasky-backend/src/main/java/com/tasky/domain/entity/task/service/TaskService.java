package com.tasky.domain.entity.task.service;

import com.tasky.domain.entity.task.TaskStatus;
import com.tasky.domain.entity.task.dto.request.CreateTaskBody;
import com.tasky.domain.entity.task.dto.request.MoveTaskBody;
import com.tasky.domain.entity.task.dto.request.UpdateTaskBody;
import com.tasky.domain.entity.task.dto.response.TaskBoardResponse;
import com.tasky.domain.entity.task.dto.response.TaskResponse;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    TaskBoardResponse getBoard(UUID boardId);

    List<TaskResponse> getTasksByUser();

    List<TaskResponse> getTasksByUserAndStatus(TaskStatus status);

    TaskResponse getTask(UUID taskId);

    TaskResponse createTask(CreateTaskBody body);

    TaskResponse updateTask(UUID taskId, UpdateTaskBody body);

    TaskResponse moveTask(UUID taskId, MoveTaskBody body);

    void deleteTask(UUID taskId);
}
