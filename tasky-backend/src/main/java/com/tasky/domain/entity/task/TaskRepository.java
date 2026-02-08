package com.tasky.domain.entity.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
    List<TaskEntity> findAllByBoardId(UUID boardId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM TaskEntity t WHERE t.boardId = :boardId")
    void deleteAllByBoardId(@Param("boardId") UUID boardId);

    List<TaskEntity> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<TaskEntity> findByTaskIdAndUserId(UUID taskId, UUID userId);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM TaskEntity t WHERE t.boardId = :boardId AND t.statusId = :statusId")
    int findMaxPositionByBoardIdAndStatusId(UUID boardId, UUID statusId);
}
