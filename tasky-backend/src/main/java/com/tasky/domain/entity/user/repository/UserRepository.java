package com.tasky.domain.entity.user.repository;


import com.tasky.domain.entity.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsernameAndStateUser(String username, Boolean stateUser);

    Optional<UserEntity> findByUsernameOrEmailAndStateUser(String username, String email, Boolean stateUser);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
