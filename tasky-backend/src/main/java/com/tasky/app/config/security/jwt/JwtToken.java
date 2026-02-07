package com.tasky.app.config.security.jwt;


import com.tasky.domain.entity.token.TokenEntity;
import com.tasky.domain.entity.token.TokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JwtToken {
    private final TokenRepository tokenRepository;

    @Value("${dev.app.jwtSecret}")
    private String secret;

    @Getter
    @Value("${dev.app.jwtExpirationMs}")
    private Long expireTimeToken;

    public JwtToken(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public String generateAccessToken(UserDetails user) {

        Collection<SimpleGrantedAuthority> authoritiesList = (Collection<SimpleGrantedAuthority>) user.getAuthorities();

        String authorities = authoritiesList.stream().map(SimpleGrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        Map<String, Object> tokenBody = new HashMap<>();
        tokenBody.put("username", user.getUsername());
        tokenBody.put("authorities", authorities);

        return this.generateToken(tokenBody, user);
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
        final Claims claims = extractAllClaims(token);
        return claimsResolvers.apply(claims);
    }

    private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        try {
            return Jwts.builder()
                    .issuer("")
                    .subject(userDetails.getUsername())
                    .expiration(new Date(System.currentTimeMillis() + expireTimeToken * 1000 * 60))
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .id(UUID.randomUUID().toString())
                    .claims(extraClaims)
                    .signWith(getSigningKey(), Jwts.SIG.HS256)
                    .compact();
        } catch (JwtException e) {
            throw new JwtException(e.getMessage());
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        JwtParser jwtParser = Jwts.parser()
                .verifyWith(getSigningKey())
                .build();
        return jwtParser.parseSignedClaims(token).getPayload();

    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Jws<Claims> validateToken(String token) {
        TokenEntity tokenValue = this.tokenRepository.findByTokenAndRevoked(token, false).orElse(null);
        if (tokenValue == null) {
            throw new JwtException("TOKEN IS INVALID");
        }
        byte[] key = secret.getBytes();
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(key))
                .build()
                .parseSignedClaims(token);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> tokenBody = new HashMap<>();
        tokenBody.put("username", userDetails.getUsername());
        return this.generateToken(tokenBody, userDetails);
    }
}
