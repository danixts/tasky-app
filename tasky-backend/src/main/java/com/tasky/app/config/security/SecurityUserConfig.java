package com.tasky.app.config.security;


import com.tasky.app.config.security.jwt.JwtRequestFilter;
import com.tasky.app.config.security.jwt.JwtToken;
import com.tasky.app.config.security.jwt.JwtUserDetails;
import com.tasky.domain.entity.user.service.UserService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityUserConfig {

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(@Qualifier("jwtUserDetailsService") JwtUserDetails jwtUserDetails, BCryptPasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider jwtProvider = new DaoAuthenticationProvider(jwtUserDetails);
        jwtProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(jwtProvider);
    }

    @Bean("jwtUserDetailsService")
    public JwtUserDetails jwtUserDetailsService(UserService userService) {
        return new JwtUserDetails(userService);
    }

    @Bean
    public JwtRequestFilter jwtRequestFilter(JwtToken jwtToken) {
        return new JwtRequestFilter(jwtToken);
    }
}
