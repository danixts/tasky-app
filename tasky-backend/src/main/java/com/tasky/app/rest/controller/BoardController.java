package com.tasky.app.rest.controller;

import com.tasky.common.model.ResponseHandler;
import com.tasky.common.model.SuccessResponse;
import com.tasky.domain.entity.board.dto.BoardResponse;
import com.tasky.domain.entity.board.dto.BoardStatusResponse;
import com.tasky.domain.entity.board.dto.CreateBoardBody;
import com.tasky.domain.entity.board.dto.UpdateBoardBody;
import com.tasky.domain.entity.board.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.v1}/boards", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Boards", description = "Board management endpoints")
public class BoardController {
    private final BoardService boardService;

    @GetMapping
    @Operation(summary = "List boards for the authenticated user")
    public ResponseEntity<SuccessResponse<List<BoardResponse>>> listBoards() {
        return ResponseHandler.success(boardService.listBoardsByUser());
    }

    @GetMapping("/{boardId}")
    @Operation(summary = "Get board by ID")
    public ResponseEntity<SuccessResponse<BoardResponse>> getBoard(@PathVariable UUID boardId) {
        return ResponseHandler.success(boardService.getBoard(boardId));
    }

    @PostMapping
    @Operation(summary = "Create a new board")
    public ResponseEntity<SuccessResponse<BoardResponse>> createBoard(@RequestBody @Valid CreateBoardBody body) {
        return ResponseHandler.success(boardService.createBoard(body), "BOARD CREATED");
    }

    @PutMapping("/{boardId}")
    @Operation(summary = "Update board name")
    public ResponseEntity<SuccessResponse<BoardResponse>> updateBoard(
            @PathVariable UUID boardId,
            @RequestBody @Valid UpdateBoardBody body) {
        return ResponseHandler.success(boardService.updateBoard(boardId, body), "BOARD UPDATED");
    }

    @DeleteMapping("/{boardId}")
    @Operation(summary = "Delete a board")
    public ResponseEntity<SuccessResponse<Void>> deleteBoard(@PathVariable UUID boardId) {
        boardService.deleteBoard(boardId);
        return ResponseHandler.success(null, "BOARD DELETED");
    }

    @GetMapping("/{boardId}/statuses")
    @Operation(summary = "List statuses for a board")
    public ResponseEntity<SuccessResponse<List<BoardStatusResponse>>> listStatuses(@PathVariable UUID boardId) {
        return ResponseHandler.success(boardService.listStatuses(boardId));
    }
}
