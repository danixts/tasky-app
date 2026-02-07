package com.tasky.common.model;

import lombok.Getter;

@Getter
public class SuccessResponse<T> {
    private final String message;
    private final Object errors;
    private final Boolean success;
    private final T data;

    public SuccessResponse(T data, String message, Boolean success) {
        this.message = message;
        this.errors = null;
        this.success = success;
        this.data = data;
    }

    public SuccessResponse(T errors, String message) {
        this.message = message;
        this.errors = errors;
        this.success = false;
        this.data = null;
    }
}
