package com.tasky.app.config.security.jwt;

import com.tasky.common.exception.ApiErrorException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {
    private final JwtToken jwtToken;

    public JwtRequestFilter(JwtToken jwtToken) {
        this.jwtToken = jwtToken;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        boolean isNullOrEmpty = authorizationHeader == null || authorizationHeader.isEmpty();
        String tokenKey = "Token ";
        if (isNullOrEmpty || !authorizationHeader.startsWith(tokenKey)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.replace(tokenKey, "");
        try {
            Jws<Claims> claimsJws = jwtToken.validateToken(token);
            Claims body = claimsJws.getPayload();

            String username = (String) body.get("username");

            String authorities;
            if (body.get("authorities") == null) {
                throw new ApiErrorException("Token is invalid");
            } else {
                authorities = (String) body.get("authorities");
            }

            Set<SimpleGrantedAuthority> simpleGrantedAuthorities = new HashSet<>();

            Arrays.asList(authorities.split(" "))
                    .forEach(a -> simpleGrantedAuthorities.add(new SimpleGrantedAuthority(a)));

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    simpleGrantedAuthorities
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (ExpiredJwtException e) {
            throw new JwtException("TOKEN IS EXPIRED");
        } catch (JwtException e) {
            throw new JwtException(e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
