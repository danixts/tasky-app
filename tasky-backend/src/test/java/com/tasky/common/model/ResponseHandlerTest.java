package com.tasky.common.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("ResponseHandler")
class ResponseHandlerTest {

    @Test
    void shouldReturnResponseWithMessage_whenSuccessCalledWithMessage() {
        ResponseEntity<SuccessResponse<String>> response = ResponseHandler.success("data", "OK");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("data", response.getBody().getData());
        assertEquals("OK", response.getBody().getMessage());
        assertTrue(response.getBody().getSuccess());
    }

    @Test
    void shouldReturnResponseWithDefaultMessage_whenSuccessCalledWithoutMessage() {
        ResponseEntity<SuccessResponse<String>> response = ResponseHandler.success("data");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("data", response.getBody().getData());
        assertEquals("COMPLETE", response.getBody().getMessage());
    }
}
