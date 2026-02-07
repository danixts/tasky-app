package com.tasky.domain.entity.board.service;

import com.tasky.domain.entity.board.dto.BoardResponse;
import com.tasky.domain.entity.board.dto.BoardStatusResponse;
import com.tasky.domain.entity.board.dto.CreateBoardBody;
import com.tasky.domain.entity.board.dto.UpdateBoardBody;

import java.util.List;
import java.util.UUID;

public interface BoardService {
    List<BoardResponse> listBoardsByUser();

    BoardResponse getBoard(UUID boardId);

    BoardResponse createBoard(CreateBoardBody body);

    BoardResponse updateBoard(UUID boardId, UpdateBoardBody body);

    void deleteBoard(UUID boardId);

    List<BoardStatusResponse> listStatuses(UUID boardId);
}
