package com.tasky.domain.entity.stats.projection;

public interface TaskCountByStatusProjection {

    String getStatusCode();

    String getStatusLabel();

    long getTaskCount();
}
