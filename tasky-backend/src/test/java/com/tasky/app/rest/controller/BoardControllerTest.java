package com.tasky.app.rest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tasky.domain.entity.board.dto.BoardResponse;
import com.tasky.domain.entity.board.dto.BoardStatusResponse;
import com.tasky.domain.entity.board.dto.CreateBoardBody;
import com.tasky.domain.entity.board.dto.UpdateBoardBody;
import com.tasky.domain.entity.board.service.BoardService;
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

@WebMvcTest(BoardController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("BoardController")
class BoardControllerTest {

    @Autowired
    MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private BoardService boardService;

    private final UUID boardId = UUID.randomUUID();

    @Test
    @WithMockUser
    void shouldReturnBoardsList_whenListBoards() throws Exception {
        var board = BoardResponse.builder()
                .boardId(boardId)
                .name("My Board")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(boardService.listBoardsByUser()).thenReturn(List.of(board));

        mockMvc.perform(get("/api/v1/boards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("My Board"));
    }

    @Test
    @WithMockUser
    void shouldReturnBoard_whenBoardExists() throws Exception {
        var board = BoardResponse.builder()
                .boardId(boardId)
                .name("Board")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(boardService.getBoard(boardId)).thenReturn(board);

        mockMvc.perform(get("/api/v1/boards/{boardId}", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Board"));
    }

    @Test
    @WithMockUser
    void shouldReturn201_whenCreateBoardWithValidData() throws Exception {
        var body = new CreateBoardBody();
        body.setName("New Board");

        var board = BoardResponse.builder()
                .boardId(boardId)
                .name("New Board")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(boardService.createBoard(any(CreateBoardBody.class))).thenReturn(board);

        mockMvc.perform(post("/api/v1/boards")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("BOARD CREATED"));
    }

    @Test
    @WithMockUser
    void shouldReturn200_whenUpdateBoardWithValidData() throws Exception {
        var body = new UpdateBoardBody();
        body.setName("Updated Board");

        var board = BoardResponse.builder()
                .boardId(boardId)
                .name("Updated Board")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(boardService.updateBoard(eq(boardId), any(UpdateBoardBody.class))).thenReturn(board);

        mockMvc.perform(put("/api/v1/boards/{boardId}", boardId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("BOARD UPDATED"));
    }

    @Test
    @WithMockUser
    void shouldReturn200_whenDeleteBoard() throws Exception {
        mockMvc.perform(delete("/api/v1/boards/{boardId}", boardId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("BOARD DELETED"));

        verify(boardService).deleteBoard(boardId);
    }

    @Test
    @WithMockUser
    void shouldReturnStatuses_whenListStatuses() throws Exception {
        var status = BoardStatusResponse.builder()
                .statusId(UUID.randomUUID())
                .code("TODO")
                .label("To Do")
                .position(0)
                .build();

        when(boardService.listStatuses(boardId)).thenReturn(List.of(status));

        mockMvc.perform(get("/api/v1/boards/{boardId}/statuses", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].code").value("TODO"));
    }
}
