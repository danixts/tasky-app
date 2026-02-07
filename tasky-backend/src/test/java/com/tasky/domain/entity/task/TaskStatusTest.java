package com.tasky.domain.entity.task;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("TaskStatus")
class TaskStatusTest {

    @Test
    void shouldContainAllStatusValues() {
        TaskStatus[] values = TaskStatus.values();

        assertEquals(3, values.length);
        assertEquals(TaskStatus.PENDING, values[0]);
        assertEquals(TaskStatus.IN_PROGRESS, values[1]);
        assertEquals(TaskStatus.COMPLETED, values[2]);
    }

    @Test
    void shouldParseCorrectly_whenValueOfCalled() {
        assertEquals(TaskStatus.PENDING, TaskStatus.valueOf("PENDING"));
        assertEquals(TaskStatus.IN_PROGRESS, TaskStatus.valueOf("IN_PROGRESS"));
        assertEquals(TaskStatus.COMPLETED, TaskStatus.valueOf("COMPLETED"));
    }
}
