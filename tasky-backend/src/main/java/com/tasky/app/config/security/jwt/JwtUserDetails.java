package com.tasky.app.config.security.jwt;

import com.tasky.common.exception.ApiErrorException;
import com.tasky.domain.entity.user.dto.ReadUserDto;
import com.tasky.domain.entity.user.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.AccountStatusUserDetailsChecker;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class JwtUserDetails implements UserDetailsService {

    private final UserService userService;

    public JwtUserDetails(UserService userService) {
        this.userService = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        ReadUserDto user = this.userService.getUserCredentials(username);
        User customUserDetails = new User(user.getUsername(), user.getPassword(), user.getStateUser()
                , true, true, true,
                this.getGrantedAuthorities(this.userService.getUserRoles(username)));

        try {
            new AccountStatusUserDetailsChecker().check(customUserDetails);
        } catch (AccountStatusException e) {
            log.error("Could not authenticate user", e);
            throw new ApiErrorException(e.getMessage());
        }

        return customUserDetails;
    }

    private List<GrantedAuthority> getGrantedAuthorities(List<String> roles) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (String privilege : roles) {
            authorities.add(new SimpleGrantedAuthority(privilege));
        }
        return authorities;
    }
}
