package com.tasky.domain.entity.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<TokenEntity, Long> {
    List<TokenEntity> findAllByUserUserIdAndRevokedIsFalse(UUID userId);

    Optional<TokenEntity> findByTokenAndRevoked(String token, boolean revoked);

    Optional<TokenEntity> findAllByUserUserIdAndRevokedIsFalseAndTokenType(UUID userId, TokenType tokenType);
}
