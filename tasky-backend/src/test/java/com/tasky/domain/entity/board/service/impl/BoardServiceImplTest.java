package com.tasky.domain.entity.board.service.impl;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.board.BoardEntity;
import com.tasky.domain.entity.board.BoardRepository;
import com.tasky.domain.entity.board.BoardStatusEntity;
import com.tasky.domain.entity.board.BoardStatusRepository;
import com.tasky.domain.entity.board.dto.BoardResponse;
import com.tasky.domain.entity.board.dto.BoardStatusResponse;
import com.tasky.domain.entity.board.dto.CreateBoardBody;
import com.tasky.domain.entity.board.dto.UpdateBoardBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BoardServiceImpl")
class BoardServiceImplTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private BoardStatusRepository boardStatusRepository;

    @Mock
    private UserContext userContext;

    @InjectMocks
    private BoardServiceImpl boardService;

    private UUID userId;
    private UUID boardId;
    private BoardEntity boardEntity;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        boardId = UUID.randomUUID();
        boardEntity = new BoardEntity();
        boardEntity.setBoardId(boardId);
        boardEntity.setUserId(userId);
        boardEntity.setName("My Board");
        boardEntity.setCreatedAt(LocalDateTime.now());
        boardEntity.setUpdatedAt(LocalDateTime.now());

        when(userContext.getUserId()).thenReturn(userId);
    }

    @Test
    void shouldReturnUserBoards_whenListBoardsByUser() {
        when(boardRepository.findAllByUserIdOrderByCreatedAtAsc(userId)).thenReturn(List.of(boardEntity));

        List<BoardResponse> result = boardService.listBoardsByUser();

        assertEquals(1, result.size());
        assertEquals(boardId, result.get(0).getBoardId());
        assertEquals("My Board", result.get(0).getName());
    }

    @Test
    void shouldReturnEmptyList_whenNoBoardsExist() {
        when(boardRepository.findAllByUserIdOrderByCreatedAtAsc(userId)).thenReturn(List.of());

        List<BoardResponse> result = boardService.listBoardsByUser();

        assertTrue(result.isEmpty());
    }

    @Test
    void shouldReturnBoard_whenBoardExists() {
        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));

        BoardResponse result = boardService.getBoard(boardId);

        assertNotNull(result);
        assertEquals(boardId, result.getBoardId());
        assertEquals("My Board", result.getName());
    }

    @Test
    void shouldThrowApiErrorException_whenBoardNotFound() {
        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> boardService.getBoard(boardId));
    }

    @Test
    void shouldCreateBoard_whenValidDataProvided() {
        var body = new CreateBoardBody();
        body.setName("New Board");

        when(boardRepository.save(any(BoardEntity.class))).thenAnswer(inv -> {
            var board = inv.getArgument(0, BoardEntity.class);
            board.setBoardId(boardId);
            return board;
        });
        when(boardStatusRepository.saveAll(any())).thenReturn(List.of());

        BoardResponse result = boardService.createBoard(body);

        assertNotNull(result);
        assertEquals("New Board", result.getName());
        verify(boardRepository).save(any(BoardEntity.class));
        verify(boardStatusRepository).saveAll(any());
    }

    @Test
    void shouldUpdateBoardName_whenBoardExists() {
        var body = new UpdateBoardBody();
        body.setName("Updated Board");

        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));
        when(boardRepository.save(any(BoardEntity.class))).thenAnswer(inv -> {
            var board = inv.getArgument(0, BoardEntity.class);
            board.setName("Updated Board");
            return board;
        });

        BoardResponse result = boardService.updateBoard(boardId, body);

        assertEquals("Updated Board", result.getName());
        verify(boardRepository).save(any(BoardEntity.class));
    }

    @Test
    void shouldDeleteBoard_whenBoardExists() {
        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));

        boardService.deleteBoard(boardId);

        verify(boardRepository).delete(boardEntity);
    }

    @Test
    void shouldReturnStatuses_whenBoardExists() {
        var statusId = UUID.randomUUID();
        var status = new BoardStatusEntity(statusId, boardId, "TODO", "To Do", 0);

        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));
        when(boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)).thenReturn(List.of(status));

        List<BoardStatusResponse> result = boardService.listStatuses(boardId);

        assertEquals(1, result.size());
        assertEquals(statusId, result.get(0).getStatusId());
        assertEquals("TODO", result.get(0).getCode());
    }
}
