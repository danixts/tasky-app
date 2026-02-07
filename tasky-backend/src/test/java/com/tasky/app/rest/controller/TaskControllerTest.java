package com.tasky.app.rest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tasky.domain.entity.task.TaskPriority;
import com.tasky.domain.entity.task.TaskStatus;
import com.tasky.domain.entity.task.dto.request.CreateTaskBody;
import com.tasky.domain.entity.task.dto.request.MoveTaskBody;
import com.tasky.domain.entity.task.dto.request.UpdateTaskBody;
import com.tasky.domain.entity.task.dto.response.TaskBoardResponse;
import com.tasky.domain.entity.task.dto.response.TaskResponse;
import com.tasky.domain.entity.task.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("TaskController")
class TaskControllerTest {

    @Autowired
    MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private TaskService taskService;

    private final UUID taskId = UUID.randomUUID();
    private final UUID boardId = UUID.randomUUID();

    @Test
    @WithMockUser
    void shouldReturnTaskBoard_whenGetBoard() throws Exception {
        var board = TaskBoardResponse.builder()
                .boardId(boardId)
                .boardName("Board")
                .columns(List.of())
                .statuses(List.of())
                .build();

        when(taskService.getBoard(boardId)).thenReturn(board);

        mockMvc.perform(get("/api/v1/tasks/board").param("boardId", boardId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.boardName").value("Board"));
    }

    @Test
    @WithMockUser
    void shouldReturnAllTasks_whenGetTasksWithoutFilter() throws Exception {
        var task = TaskResponse.builder()
                .taskId(taskId)
                .title("Task")
                .status(TaskStatus.PENDING)
                .priority(TaskPriority.NORMAL)
                .boardId(boardId)
                .build();

        when(taskService.getTasksByUser()).thenReturn(List.of(task));

        mockMvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Task"));
    }

    @Test
    @WithMockUser
    void shouldReturnFilteredTasks_whenGetTasksWithStatus() throws Exception {
        var task = TaskResponse.builder()
                .taskId(taskId)
                .title("Task")
                .status(TaskStatus.PENDING)
                .build();

        when(taskService.getTasksByUserAndStatus(TaskStatus.PENDING)).thenReturn(List.of(task));

        mockMvc.perform(get("/api/v1/tasks").param("status", "PENDING"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void shouldReturnTask_whenTaskExists() throws Exception {
        var task = TaskResponse.builder()
                .taskId(taskId)
                .title("Task")
                .status(TaskStatus.PENDING)
                .priority(TaskPriority.NORMAL)
                .boardId(boardId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(taskService.getTask(taskId)).thenReturn(task);

        mockMvc.perform(get("/api/v1/tasks/{taskId}", taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Task"));
    }

    @Test
    @WithMockUser
    void shouldReturn201_whenCreateTaskWithValidData() throws Exception {
        var body = new CreateTaskBody();
        body.setBoardId(boardId);
        body.setTitle("New Task");

        var task = TaskResponse.builder()
                .taskId(taskId)
                .title("New Task")
                .status(TaskStatus.PENDING)
                .priority(TaskPriority.NORMAL)
                .boardId(boardId)
                .build();

        when(taskService.createTask(any(CreateTaskBody.class))).thenReturn(task);

        mockMvc.perform(post("/api/v1/tasks")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("TASK CREATED"));
    }

    @Test
    @WithMockUser
    void shouldReturn200_whenUpdateTaskWithValidData() throws Exception {
        var body = new UpdateTaskBody();
        body.setTitle("Updated Task");
        body.setStatus(TaskStatus.PENDING);

        var task = TaskResponse.builder()
                .taskId(taskId)
                .title("Updated Task")
                .status(TaskStatus.PENDING)
                .build();

        when(taskService.updateTask(eq(taskId), any(UpdateTaskBody.class))).thenReturn(task);

        mockMvc.perform(put("/api/v1/tasks/{taskId}", taskId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("TASK UPDATED"));
    }

    @Test
    @WithMockUser
    void shouldReturn200_whenMoveTaskWithValidData() throws Exception {
        var body = new MoveTaskBody();
        body.setStatusId(UUID.randomUUID());
        body.setPosition(1);

        var task = TaskResponse.builder()
                .taskId(taskId)
                .title("Task")
                .status(TaskStatus.IN_PROGRESS)
                .build();

        when(taskService.moveTask(eq(taskId), any(MoveTaskBody.class))).thenReturn(task);

        mockMvc.perform(patch("/api/v1/tasks/{taskId}/move", taskId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("TASK MOVED"));
    }

    @Test
    @WithMockUser
    void shouldReturn200_whenDeleteTask() throws Exception {
        mockMvc.perform(delete("/api/v1/tasks/{taskId}", taskId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("TASK DELETED"));

        verify(taskService).deleteTask(taskId);
    }
}
