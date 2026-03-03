package com.Judge_Mental.XorOJ.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.StandingsSnapshotEntity;

@Repository
public interface StandingsSnapshotRepository extends JpaRepository<StandingsSnapshotEntity, Long> {}
