package com.tasky.domain.entity.task.dto.request;

import com.tasky.domain.entity.task.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoveTaskRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;
}
