package com.tasky.domain.entity.user;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tasky.domain.entity.base.BaseEntity;
import com.tasky.domain.entity.role.RoleEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.util.UUID;

@Getter
@Setter
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class UserEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    @ColumnDefault("gen_random_uuid()")
    private UUID userId;

    @Column
    @JsonIgnore
    private Boolean superUser;

    @Column(unique = true, columnDefinition = "varchar")
    private String username;

    @Column(columnDefinition = "varchar")
    @JsonIgnore
    private String password;

    @Column(unique = true, columnDefinition = "varchar")
    private String email;

    @JsonIgnore
    @Column
    private Boolean stateUser;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", referencedColumnName = "role_id", nullable = false)
    private RoleEntity role;

    @PrePersist
    void onPersist() {
        this.setSuperUser(false);
        this.setStateUser(true);
    }
}
