package com.tasky.domain.entity.task.dto.response;

import com.tasky.domain.entity.board.dto.BoardStatusResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class TaskBoardResponse {
    private UUID boardId;
    private String boardName;
    private List<BoardStatusResponse> statuses;
    private List<BoardColumnResponse> columns;
}

