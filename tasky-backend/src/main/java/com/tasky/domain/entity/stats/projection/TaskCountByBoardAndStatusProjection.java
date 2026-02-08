package com.tasky.domain.entity.stats.projection;

import java.util.UUID;

public interface TaskCountByBoardAndStatusProjection {

    UUID getBoardId();

    String getBoardName();

    String getStatusCode();

    String getStatusLabel();

    long getTaskCount();
}
