package com.tasky.domain.entity.board;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "board_statuses")
@NoArgsConstructor
public class BoardStatusEntity {

    @Id
    @Column(name = "status_id", columnDefinition = "uuid")
    private UUID statusId;

    @Column(name = "board_id", nullable = false, columnDefinition = "uuid")
    private UUID boardId;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private Integer position = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", insertable = false, updatable = false)
    private BoardEntity board;

    public BoardStatusEntity(UUID statusId, UUID boardId, String code, String label, Integer position) {
        this.statusId = statusId;
        this.boardId = boardId;
        this.code = code;
        this.label = label;
        this.position = position;
    }
}
