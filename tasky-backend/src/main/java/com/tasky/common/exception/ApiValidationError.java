package com.tasky.common.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
public class ApiValidationError implements ApiSubError {
    private String field;
    private String message;

    ApiValidationError(String message) {
        this.message = message;
    }
}