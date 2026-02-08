package com.tasky.domain.entity.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardStatusRepository extends JpaRepository<BoardStatusEntity, UUID> {
    List<BoardStatusEntity> findAllByBoardIdOrderByPositionAsc(UUID boardId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM BoardStatusEntity s WHERE s.boardId = :boardId")
    void deleteAllByBoardId(@Param("boardId") UUID boardId);
    Optional<BoardStatusEntity> findByStatusIdAndBoardId(UUID statusId, UUID boardId);
}
