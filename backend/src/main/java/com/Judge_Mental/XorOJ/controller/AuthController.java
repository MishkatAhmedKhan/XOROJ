package com.Judge_Mental.XorOJ.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> login(@RequestBody XUser user) {
        try {
            String token = userService.verify(user);
            if (token != null) {
                return ResponseEntity.ok(token);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody XUser user) {
        try {
            if (user.getFirstName() == null || user.getFirstName().isBlank()) {
                user.setFirstName(user.getUsername());
            }
            user.setPassword(encoder.encode(user.getPassword()));
            XUser saved = userService.register(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Registration failed";
            if (msg.contains("username")) {
                msg = "Username already taken";
            } else if (msg.contains("email")) {
                msg = "Email already registered";
            } else {
                msg = "Registration failed: " + msg;
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", msg));
        }
    }
}
