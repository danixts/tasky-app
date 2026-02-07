package com.tasky.domain.entity.board.service.impl;

import com.tasky.app.config.cache.CacheConfig;
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
import com.tasky.domain.entity.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private static final String DEFAULT_STATUS_TODO = "TODO";
    private static final String DEFAULT_STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String DEFAULT_STATUS_COMPLETED = "COMPLETED";

    private final BoardRepository boardRepository;
    private final BoardStatusRepository boardStatusRepository;
    private final UserContext userContext;

    @Override
    @Cacheable(value = CacheConfig.BOARDS, key = "@userContext.getUserId()")
    public List<BoardResponse> listBoardsByUser() {
        var userId = userContext.getUserId();
        return boardRepository.findAllByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::toBoardResponse)
                .toList();
    }

    @Override
    @Cacheable(value = CacheConfig.BOARD, key = "@userContext.getUserId() + ':' + #boardId")
    public BoardResponse getBoard(UUID boardId) {
        return toBoardResponse(findBoardOrThrow(boardId));
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.BOARDS, key = "@userContext.getUserId()")
    public BoardResponse createBoard(CreateBoardBody body) {
        var userId = userContext.getUserId();
        var now = LocalDateTime.now();
        var board = new BoardEntity();
        board.setBoardId(UUID.randomUUID());
        board.setUserId(userId);
        board.setName(body.getName());
        board.setCreatedAt(now);
        board.setUpdatedAt(now);
        board = boardRepository.save(board);
        createDefaultStatuses(board.getBoardId());
        return toBoardResponse(board);
    }

    @Override
    @Transactional
    @CacheEvict(value = { CacheConfig.BOARDS, CacheConfig.BOARD, CacheConfig.BOARD_STATUSES, CacheConfig.TASK_BOARD }, key = "@userContext.getUserId() + ':' + #boardId")
    public BoardResponse updateBoard(UUID boardId, UpdateBoardBody body) {
        var board = findBoardOrThrow(boardId);
        board.setName(body.getName());
        return toBoardResponse(boardRepository.save(board));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = {CacheConfig.BOARDS, CacheConfig.BOARD, CacheConfig.BOARD_STATUSES, CacheConfig.TASK_BOARD}, key = "@userContext.getUserId() + ':' + #boardId"),
            @CacheEvict(value = CacheConfig.TASK, key = "'list:' + @userContext.getUserId()")
    })
    public void deleteBoard(UUID boardId) {
        var board = findBoardOrThrow(boardId);
        boardRepository.delete(board);
    }

    @Override
    @Cacheable(value = CacheConfig.BOARD_STATUSES, key = "@userContext.getUserId() + ':' + #boardId")
    public List<BoardStatusResponse> listStatuses(UUID boardId) {
        findBoardOrThrow(boardId);
        return boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)
                .stream()
                .map(this::toStatusResponse)
                .toList();
    }

    private void createDefaultStatuses(UUID boardId) {
        var statuses = List.of(
                new BoardStatusEntity(UUID.randomUUID(), boardId, DEFAULT_STATUS_TODO, "To Do", 0),
                new BoardStatusEntity(UUID.randomUUID(), boardId, DEFAULT_STATUS_IN_PROGRESS, "In Progress", 1),
                new BoardStatusEntity(UUID.randomUUID(), boardId, DEFAULT_STATUS_COMPLETED, "Complete", 2)
        );
        boardStatusRepository.saveAll(statuses);
    }

    private BoardEntity findBoardOrThrow(UUID boardId) {
        var userId = userContext.getUserId();
        return boardRepository.findByBoardIdAndUserId(boardId, userId).orElseThrow(
                () -> new ApiErrorException("BOARD NOT FOUND", HttpStatus.NOT_FOUND, null, false)
        );
    }

    private BoardResponse toBoardResponse(BoardEntity entity) {
        return BoardResponse.builder()
                .boardId(entity.getBoardId())
                .name(entity.getName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private BoardStatusResponse toStatusResponse(BoardStatusEntity entity) {
        return BoardStatusResponse.builder()
                .statusId(entity.getStatusId())
                .code(entity.getCode())
                .label(entity.getLabel())
                .position(entity.getPosition())
                .build();
    }
}
