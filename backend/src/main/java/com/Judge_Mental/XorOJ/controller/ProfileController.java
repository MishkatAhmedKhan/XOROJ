package com.Judge_Mental.XorOJ.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.user.XUser;
import com.Judge_Mental.XorOJ.user.XUserRepository;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired
    private XUserRepository repository;

    @GetMapping("{username}")
    public ResponseEntity<XUser> getProfileByUsername(@PathVariable String username) {
        Optional<XUser> pdata = repository.findByUsername(username);

        if (pdata.isPresent()) {
            XUser profile = pdata.get();

            return ResponseEntity.ok(profile);
        } else {
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);  
        }
    }    
}
