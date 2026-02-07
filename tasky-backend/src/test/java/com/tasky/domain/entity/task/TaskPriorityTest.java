package com.tasky.domain.entity.task;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("TaskPriority")
class TaskPriorityTest {

    @Test
    void shouldContainAllPriorityValues() {
        TaskPriority[] values = TaskPriority.values();

        assertEquals(3, values.length);
        assertEquals(TaskPriority.LOW, values[0]);
        assertEquals(TaskPriority.NORMAL, values[1]);
        assertEquals(TaskPriority.HIGH, values[2]);
    }

    @Test
    void shouldParseCorrectly_whenValueOfCalled() {
        assertEquals(TaskPriority.LOW, TaskPriority.valueOf("LOW"));
        assertEquals(TaskPriority.NORMAL, TaskPriority.valueOf("NORMAL"));
        assertEquals(TaskPriority.HIGH, TaskPriority.valueOf("HIGH"));
    }
}
