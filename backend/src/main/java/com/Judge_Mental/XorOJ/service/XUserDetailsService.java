package com.Judge_Mental.XorOJ.service;

import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.entity.XUserPrincipal;
import com.Judge_Mental.XorOJ.repo.XUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class XUserDetailsService implements UserDetailsService {

    @Autowired
    private XUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        XUser user = userRepository.findByUsername(username);

        if(user == null){
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        
        return new XUserPrincipal(user);
    }
}
