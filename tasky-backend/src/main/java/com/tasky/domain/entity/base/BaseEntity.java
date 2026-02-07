package com.tasky.domain.entity.base;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @JsonIgnore
    @Column(columnDefinition = "boolean default true")
    private Boolean isActive;

    @JsonIgnore
    @LastModifiedBy
    @Column
    private String userUpdate;

    @JsonIgnore
    @CreatedBy
    @Column
    private String userCreate;

    @JsonIgnore
    @CreatedDate
    @Column(columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private LocalDateTime createDate;

    @JsonIgnore
    @Column(columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    @LastModifiedDate
    private LocalDateTime updateDate;
}
