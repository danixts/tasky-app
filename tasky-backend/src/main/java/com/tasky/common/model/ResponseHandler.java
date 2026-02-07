package com.tasky.common.model;

import org.springframework.http.ResponseEntity;

public class ResponseHandler {
    private ResponseHandler() {
        throw new IllegalStateException("Utility class");
    }

    public static <T> ResponseEntity<SuccessResponse<T>> success(T data, String message) {
        return ResponseEntity.ok(new SuccessResponse<>(data, message, true));
    }

    public static <T> ResponseEntity<SuccessResponse<T>> success(T data) {
        return ResponseEntity.ok(new SuccessResponse<>(data, "COMPLETE", true));
    }
}