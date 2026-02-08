package com.tasky.domain.entity.user.repository;


import com.tasky.domain.entity.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsernameAndStateUser(String username, Boolean stateUser);

    @Query("SELECT u FROM UserEntity u JOIN FETCH u.role WHERE u.username = :username AND u.stateUser = :stateUser")
    Optional<UserEntity> findByUsernameAndStateUserWithRole(@Param("username") String username, @Param("stateUser") Boolean stateUser);

    Optional<UserEntity> findByUsernameOrEmailAndStateUser(String username, String email, Boolean stateUser);

    @Query("SELECT u FROM UserEntity u JOIN FETCH u.role WHERE (u.username = :username OR u.email = :email) AND u.stateUser = :stateUser")
    Optional<UserEntity> findByUsernameOrEmailAndStateUserWithRole(@Param("username") String username, @Param("email") String email, @Param("stateUser") Boolean stateUser);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
