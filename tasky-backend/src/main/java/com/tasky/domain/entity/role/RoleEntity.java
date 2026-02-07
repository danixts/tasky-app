package com.tasky.domain.entity.role;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tasky.domain.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
@Entity
public class RoleEntity extends BaseEntity {
    @Id
    @Column(name = "role_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roleId;

    @Column(columnDefinition = "varchar")
    private String code;

    @JsonIgnore
    @Column(columnDefinition = "varchar")
    private String description;
}
