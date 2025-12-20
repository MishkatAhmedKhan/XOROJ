package com.Judge_Mental.XorOJ.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface XUserRepository extends JpaRepository<XUser, Long> {
    Optional<XUser> findById(Long id);
    Optional<XUser> findByUsername(String username);
    Optional<XUser> findByEmail(String email);
}
