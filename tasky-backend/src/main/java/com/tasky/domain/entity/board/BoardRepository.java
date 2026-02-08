package com.tasky.domain.entity.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardRepository extends JpaRepository<BoardEntity, UUID> {
    List<BoardEntity> findAllByUserIdOrderByCreatedAtAsc(UUID userId);
    Optional<BoardEntity> findByBoardIdAndUserId(UUID boardId, UUID userId);

    @Query("SELECT b FROM BoardEntity b LEFT JOIN FETCH b.statuses WHERE b.boardId = :boardId AND b.userId = :userId")
    Optional<BoardEntity> findByBoardIdAndUserIdWithStatuses(@Param("boardId") UUID boardId, @Param("userId") UUID userId);
}
