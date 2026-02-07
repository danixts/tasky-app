package com.tasky.common.exception;

import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.NonUniqueResultException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.SQLGrammarException;
import org.hibernate.tool.schema.spi.SqlScriptException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Objects;

@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class CustomExceptionHandler {
    @ExceptionHandler(value = JwtException.class)
    public ResponseEntity<Object> handleJwtException(JwtException ex) {
        log.error("JWT error: {}", ex.getMessage());
        ApiError apiError = new ApiError();
        apiError.setStatus(HttpStatus.UNAUTHORIZED);
        apiError.setData(List.of());
        apiError.setMessage("TOKEN NOT VALID");
        apiError.setErrors(List.of());
        apiError.setSuccess(false);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentialsException(BadCredentialsException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = EntityNotFoundException.class)
    public ResponseEntity<Object> handleEntityNotFoundException(EntityNotFoundException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = EntityExistsException.class)
    public ResponseEntity<Object> handleEntityExistsException(EntityExistsException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException ex) {
        ApiError apiError = new ApiError(HttpStatus.UNPROCESSABLE_ENTITY);
        apiError.setMessage("ERROR VALIDATION");
        apiError.addValidationErrors(ex.getConstraintViolations());
        apiError.setData(null);
        apiError.setSuccess(false);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        ApiError apiError = new ApiError();
        apiError.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        apiError.setData(null);
        apiError.setMessage("INTERNAL SERVER ERROR");
        apiError.setErrors(List.of());
        apiError.setSuccess(false);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(ApiErrorException.class)
    protected ResponseEntity<Object> handleEntityNotFound(ApiErrorException ex) {
        ApiError apiError = new ApiError();
        apiError.setStatus(ex.getStatus());
        apiError.setData(ex.getData());
        apiError.setMessage(ex.getMessage());
        apiError.setErrors(ex.getErrors() != null ? (List) ex.getErrors() : null);
        apiError.setSuccess(ex.getSuccess());
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = JpaSystemException.class)
    public ResponseEntity<Object> handleJpaSystemException(JpaSystemException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = HttpMessageNotWritableException.class)
    public ResponseEntity<Object> handleHttpMessageNotWritableException(HttpMessageNotWritableException ex) {
        log.error("JSON serialization error: {}", ex.getMessage());
        ApiError apiError = new ApiError();
        apiError.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        apiError.setData(List.of());
        apiError.setMessage("Error processing response");
        apiError.setErrors(List.of());
        apiError.setSuccess(false);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database constraint error: {}", ex.getMessage());
        if (ex.getCause() instanceof ConstraintViolationException) {
            return buildResponseEntity(new ApiError(HttpStatus.CONFLICT, "Database error", ex.getCause()));
        }
        return buildResponseEntity(new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, ex));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    protected ResponseEntity<Object> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.error("Invalid request parameter: {}", ex.getMessage());
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST);
        apiError.setMessage(String.format("The parameter '%s' of value '%s' could not be converted to type '%s'", ex.getName(), ex.getValue(), Objects.requireNonNull(ex.getRequiredType()).getSimpleName()));
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(NullPointerException.class)
    protected ResponseEntity<Object> handleNullPointerException(NullPointerException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.NOT_FOUND);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    protected ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.NOT_FOUND);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(NonUniqueResultException.class)
    protected ResponseEntity<Object> handleNonUniqueResultException(NonUniqueResultException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.SERVICE_UNAVAILABLE);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(SQLGrammarException.class)
    protected ResponseEntity<Object> handleSQLGrammarException(SQLGrammarException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.SERVICE_UNAVAILABLE);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(DataAccessResourceFailureException.class)
    protected ResponseEntity<Object> handleDataAccessResourceFailureException(DataAccessResourceFailureException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(SqlScriptException.class)
    protected ResponseEntity<Object> handleDataAccessResourceFailureException(SqlScriptException ex) {
        ApiError apiError = this.buildApiError(ex, HttpStatus.BAD_REQUEST);
        return buildResponseEntity(apiError);
    }

    @ExceptionHandler(value = ValidationException.class)
    public ResponseEntity<String> handleException(ValidationException exception) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationErrors(MethodArgumentNotValidException ex) {
        ApiError apiError = new ApiError(HttpStatus.UNPROCESSABLE_ENTITY);
        apiError.setMessage("ERROR VALIDATION");
        apiError.addValidationErrors(ex.getBindingResult().getFieldErrors());
        apiError.addValidationError(ex.getBindingResult().getGlobalErrors());
        apiError.setData(null);
        apiError.setSuccess(false);
        return buildResponseEntity(apiError);
    }

    private ApiError buildApiError(Exception ex, HttpStatus httpStatus) {
        log.error("Request processing error: {}", ex.getMessage());
        ApiError apiError = new ApiError();
        apiError.setStatus(httpStatus);
        apiError.setData(List.of());
        apiError.setMessage(ex.getMessage());
        apiError.setErrors(List.of());
        apiError.setSuccess(false);
        return apiError;
    }

    private ResponseEntity<Object> buildResponseEntity(ApiError apiError) {
        return new ResponseEntity<>(apiError, apiError.getStatus());
    }

}
