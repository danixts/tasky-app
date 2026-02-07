package com.tasky.domain.entity.task.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class MoveTaskBody {

    @NotNull(message = "Status ID is required")
    private UUID statusId;

    @NotNull(message = "Position is required")
    private Integer position;
}
