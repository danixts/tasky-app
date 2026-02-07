package com.tasky.domain.entity.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardStatusRepository extends JpaRepository<BoardStatusEntity, UUID> {
    List<BoardStatusEntity> findAllByBoardIdOrderByPositionAsc(UUID boardId);
    Optional<BoardStatusEntity> findByStatusIdAndBoardId(UUID statusId, UUID boardId);
}
