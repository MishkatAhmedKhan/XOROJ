package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.repo.XUserRepository;

@Service
public class XUserService {
    
    @Autowired
    private XUserRepository repository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public XUser register(XUser user){
        return repository.save(user);
    }

    public String verify(XUser user){
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        return authentication.isAuthenticated() ? jwtService.generateToken(user.getUsername()) : null;
    }

    public XUser findByUsername(String username) {
        return repository.findByUsername(username);
    }

    public XUser save(XUser user) {
        return repository.save(user);
    }
}
