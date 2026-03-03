package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class XUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    @Size(min = 4, message = "Password must be at least 4 characters long")
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    private String lastName;
    private String bio;
    private String institute;
    private String country;
    private String contact;

    private String role;

}

