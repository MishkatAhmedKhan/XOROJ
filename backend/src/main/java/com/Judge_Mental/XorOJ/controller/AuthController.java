package com.Judge_Mental.XorOJ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.service.XUserService;

@RestController
@RequestMapping("api/auth")
public class AuthController {

    @Autowired
    private XUserService userService;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/login")
    public String login(@RequestBody XUser user){
        return userService.verify(user);
    }

    @PostMapping("/register")
    public XUser register(@RequestBody XUser user){
        user.setPassword(encoder.encode(user.getPassword()));
        return userService.register(user);
    }
    
}
