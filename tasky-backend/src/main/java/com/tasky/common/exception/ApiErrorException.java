package com.tasky.common.exception;

import lombok.Getter;
import lombok.Setter;
import org.springdoc.api.ErrorMessage;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Objects;

@Getter
@Setter
public class ApiErrorException extends RuntimeException {

    private final HttpStatus status;
    private final transient Objects data;
    private final Boolean success;
    private Object errors;

    public ApiErrorException(String message) {
        super(message);
        this.success = false;
        this.errors = null;
        this.data = null;
        this.status = HttpStatus.NOT_FOUND;
    }

    public ApiErrorException(String message, HttpStatus status, Objects data, Boolean success) {
        super(message);
        this.status = status;
        this.data = data;
        this.success = success;
    }

    public ApiErrorException(ErrorMessage message, HttpStatus status, Objects data, Boolean success) {
        super(message.toString());
        this.status = status;
        this.data = data;
        this.success = success;
    }

    public ApiErrorException(String message, HttpStatus status, Object errors) {
        super(message);
        this.status = status;
        this.data = null;
        this.errors = errors != null ? errors : List.of();
        this.success = false;
    }

    public ApiErrorException(ErrorMessage message, HttpStatus status, Object errors) {
        super(message.toString());
        this.status = status;
        this.data = null;
        this.errors = errors;
        this.success = false;
    }
}
