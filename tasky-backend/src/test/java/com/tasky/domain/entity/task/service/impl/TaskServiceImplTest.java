package com.tasky.domain.entity.task.service.impl;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.common.utils.UserContext;
import com.tasky.domain.entity.board.BoardEntity;
import com.tasky.domain.entity.board.BoardRepository;
import com.tasky.domain.entity.board.BoardStatusEntity;
import com.tasky.domain.entity.board.BoardStatusRepository;
import com.tasky.domain.entity.task.TaskEntity;
import com.tasky.domain.entity.task.TaskPriority;
import com.tasky.domain.entity.task.TaskRepository;
import com.tasky.domain.entity.task.TaskStatus;
import com.tasky.domain.entity.task.dto.request.CreateTaskBody;
import com.tasky.domain.entity.task.dto.request.MoveTaskBody;
import com.tasky.domain.entity.task.dto.request.UpdateTaskBody;
import com.tasky.domain.entity.task.dto.response.TaskBoardResponse;
import com.tasky.domain.entity.task.dto.response.TaskResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskServiceImpl")
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private BoardStatusRepository boardStatusRepository;

    @Mock
    private UserContext userContext;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private TaskServiceImpl taskService;

    private UUID userId;
    private UUID boardId;
    private UUID taskId;
    private UUID statusId;
    private BoardEntity boardEntity;
    private BoardStatusEntity statusEntity;
    private TaskEntity taskEntity;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        boardId = UUID.randomUUID();
        taskId = UUID.randomUUID();
        statusId = UUID.randomUUID();

        boardEntity = new BoardEntity();
        boardEntity.setBoardId(boardId);
        boardEntity.setUserId(userId);
        boardEntity.setName("Board");

        statusEntity = new BoardStatusEntity(statusId, boardId, "TODO", "To Do", 0);

        taskEntity = new TaskEntity();
        taskEntity.setTaskId(taskId);
        taskEntity.setUserId(userId);
        taskEntity.setBoardId(boardId);
        taskEntity.setStatusId(statusId);
        taskEntity.setTitle("Task");
        taskEntity.setPosition(0);
        taskEntity.setPriority(TaskPriority.NORMAL);
        taskEntity.setCreatedAt(LocalDateTime.now());
        taskEntity.setUpdatedAt(LocalDateTime.now());

        when(userContext.getUserId()).thenReturn(userId);
        lenient().when(cacheManager.getCache(anyString())).thenReturn(cache);
    }

    @Test
    void shouldReturnTaskBoardResponse_whenBoardExists() {
        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));
        when(boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)).thenReturn(List.of(statusEntity));
        when(taskRepository.findAllByBoardId(boardId)).thenReturn(List.of(taskEntity));

        TaskBoardResponse result = taskService.getBoard(boardId);

        assertNotNull(result);
        assertEquals(boardId, result.getBoardId());
        assertEquals("Board", result.getBoardName());
        assertEquals(1, result.getColumns().size());
    }

    @Test
    void shouldThrowApiErrorException_whenBoardNotFound() {
        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> taskService.getBoard(boardId));
    }

    @Test
    void shouldReturnUserTasks_whenGetTasksByUser() {
        when(taskRepository.findAllByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(taskEntity));
        when(boardStatusRepository.findAllById(List.of(statusId))).thenReturn(List.of(statusEntity));

        List<TaskResponse> result = taskService.getTasksByUser();

        assertEquals(1, result.size());
        assertEquals(taskId, result.get(0).getTaskId());
        assertEquals("Task", result.get(0).getTitle());
    }

    @Test
    void shouldFilterByStatus_whenGetTasksByUserAndStatus() {
        when(taskRepository.findAllByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(taskEntity));
        when(boardStatusRepository.findAllById(List.of(statusId))).thenReturn(List.of(statusEntity));

        List<TaskResponse> result = taskService.getTasksByUserAndStatus(TaskStatus.PENDING);

        assertEquals(1, result.size());
    }

    @Test
    void shouldReturnTask_whenTaskExists() {
        when(taskRepository.findByTaskIdAndUserId(taskId, userId)).thenReturn(Optional.of(taskEntity));
        when(boardStatusRepository.findById(statusId)).thenReturn(Optional.of(statusEntity));

        TaskResponse result = taskService.getTask(taskId);

        assertNotNull(result);
        assertEquals(taskId, result.getTaskId());
        assertEquals("Task", result.getTitle());
    }

    @Test
    void shouldThrowApiErrorException_whenTaskNotFound() {
        when(taskRepository.findByTaskIdAndUserId(taskId, userId)).thenReturn(Optional.empty());

        assertThrows(ApiErrorException.class, () -> taskService.getTask(taskId));
    }

    @Test
    void shouldCreateTask_whenValidDataProvided() {
        var body = new CreateTaskBody();
        body.setBoardId(boardId);
        body.setTitle("New Task");
        body.setDescription("Desc");

        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));
        when(boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)).thenReturn(List.of(statusEntity));
        when(taskRepository.findMaxPositionByBoardIdAndStatusId(boardId, statusId)).thenReturn(0);
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse result = taskService.createTask(body);

        assertNotNull(result);
        assertEquals("New Task", result.getTitle());
        verify(taskRepository).save(any(TaskEntity.class));
    }

    @Test
    void shouldThrowApiErrorException_whenBoardHasNoStatuses() {
        var body = new CreateTaskBody();
        body.setBoardId(boardId);
        body.setTitle("Task");

        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));
        when(boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)).thenReturn(List.of());

        assertThrows(ApiErrorException.class, () -> taskService.createTask(body));
    }

    @Test
    void shouldUpdateTask_whenTaskExists() {
        var body = new UpdateTaskBody();
        body.setTitle("Updated Task");
        body.setDescription("New desc");
        body.setStatus(TaskStatus.PENDING);

        when(taskRepository.findByTaskIdAndUserId(taskId, userId)).thenReturn(Optional.of(taskEntity));
        when(boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)).thenReturn(List.of(statusEntity));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse result = taskService.updateTask(taskId, body);

        assertEquals("Updated Task", result.getTitle());
        verify(taskRepository).save(any(TaskEntity.class));
    }

    @Test
    void shouldMoveTask_whenValidDataProvided() {
        var body = new MoveTaskBody();
        body.setStatusId(statusId);
        body.setPosition(1);

        when(taskRepository.findByTaskIdAndUserId(taskId, userId)).thenReturn(Optional.of(taskEntity));
        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));
        when(boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)).thenReturn(List.of(statusEntity));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse result = taskService.moveTask(taskId, body);

        assertNotNull(result);
        verify(taskRepository).save(any(TaskEntity.class));
    }

    @Test
    void shouldThrowApiErrorException_whenInvalidStatusForMove() {
        var body = new MoveTaskBody();
        body.setStatusId(UUID.randomUUID());
        body.setPosition(1);

        when(taskRepository.findByTaskIdAndUserId(taskId, userId)).thenReturn(Optional.of(taskEntity));
        when(boardRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardEntity));
        when(boardStatusRepository.findAllByBoardIdOrderByPositionAsc(boardId)).thenReturn(List.of(statusEntity));

        assertThrows(ApiErrorException.class, () -> taskService.moveTask(taskId, body));
    }

    @Test
    void shouldDeleteTask_whenTaskExists() {
        when(taskRepository.findByTaskIdAndUserId(taskId, userId)).thenReturn(Optional.of(taskEntity));

        taskService.deleteTask(taskId);

        verify(taskRepository).delete(taskEntity);
    }
}
