package com.tasky.domain.entity.task.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TaskBoardResponse {
    private List<TaskResponse> pending;
    private List<TaskResponse> inProgress;
    private List<TaskResponse> completed;
}
