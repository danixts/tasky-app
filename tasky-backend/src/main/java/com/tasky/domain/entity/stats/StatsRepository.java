package com.tasky.domain.entity.stats;

import com.tasky.domain.entity.board.BoardEntity;
import com.tasky.domain.entity.stats.projection.TaskCountByBoardAndStatusProjection;
import com.tasky.domain.entity.stats.projection.TaskCountByStatusProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StatsRepository extends JpaRepository<BoardEntity, UUID> {

    @Query(value = "SELECT * FROM get_tasks_by_status_for_user(:userId)", nativeQuery = true)
    List<TaskCountByStatusProjection> findTaskCountByStatusForUser(@Param("userId") UUID userId);

    @Query(value = "SELECT * FROM get_tasks_by_board_and_status_for_user(:userId)", nativeQuery = true)
    List<TaskCountByBoardAndStatusProjection> findTaskCountByBoardAndStatusForUser(@Param("userId") UUID userId);
}
