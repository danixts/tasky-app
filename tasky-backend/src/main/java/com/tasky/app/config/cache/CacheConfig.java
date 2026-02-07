package com.tasky.app.config.cache;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    public static final String BOARDS = "boards";
    public static final String BOARD = "board";
    public static final String BOARD_STATUSES = "boardStatuses";
    public static final String TASK_BOARD = "taskBoard";
    public static final String TASK = "task";
}
