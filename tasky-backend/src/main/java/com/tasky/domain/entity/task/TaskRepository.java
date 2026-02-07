package com.tasky.domain.entity.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
    List<TaskEntity> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<TaskEntity> findAllByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, TaskStatus status);

    Optional<TaskEntity> findByTaskIdAndUserId(UUID taskId, UUID userId);
}
