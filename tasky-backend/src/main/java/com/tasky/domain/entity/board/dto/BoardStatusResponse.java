package com.tasky.domain.entity.board.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class BoardStatusResponse {
    private UUID statusId;
    private String code;
    private String label;
    private Integer position;
}
