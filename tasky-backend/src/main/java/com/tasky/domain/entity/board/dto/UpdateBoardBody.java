package com.tasky.domain.entity.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateBoardBody {
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;
}
