package com.tasky.domain.entity.task.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class BoardColumnResponse {
    private UUID statusId;
    private List<TaskResponse> tasks;
}
