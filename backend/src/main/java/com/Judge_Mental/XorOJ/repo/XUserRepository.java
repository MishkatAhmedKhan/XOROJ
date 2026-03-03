package com.Judge_Mental.XorOJ.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.XUser;

@Repository
public interface XUserRepository extends JpaRepository<XUser, Long> {
    XUser findByUsername(String username);
    XUser findByEmail(String email);
}
