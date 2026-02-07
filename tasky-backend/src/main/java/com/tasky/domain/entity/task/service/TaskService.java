package com.tasky.domain.entity.task.service;

import com.tasky.domain.entity.task.TaskStatus;
import com.tasky.domain.entity.task.dto.request.CreateTaskRequest;
import com.tasky.domain.entity.task.dto.request.UpdateTaskRequest;
import com.tasky.domain.entity.task.dto.response.TaskBoardResponse;
import com.tasky.domain.entity.task.dto.response.TaskResponse;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    TaskBoardResponse getBoard();

    List<TaskResponse> getTasksByUser();

    List<TaskResponse> getTasksByUserAndStatus(TaskStatus status);

    TaskResponse getTask(UUID taskId);

    TaskResponse createTask(CreateTaskRequest request);

    TaskResponse updateTask(UUID taskId, UpdateTaskRequest request);

    TaskResponse moveTask(UUID taskId, TaskStatus status);

    void deleteTask(UUID taskId);
}
