package com.Judge_Mental.XorOJ.repo;

import com.Judge_Mental.XorOJ.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByChangedAtDesc(Pageable pageable);

    Page<AuditLog> findByTableNameOrderByChangedAtDesc(String tableName, Pageable pageable);

    Page<AuditLog> findByOperationOrderByChangedAtDesc(String operation, Pageable pageable);

    Page<AuditLog> findByTableNameAndOperationOrderByChangedAtDesc(
            String tableName, String operation, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.changedAt BETWEEN :start AND :end ORDER BY a.changedAt DESC")
    List<AuditLog> findByDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT a FROM AuditLog a WHERE a.rowId = :rowId AND a.tableName = :tableName ORDER BY a.changedAt DESC")
    List<AuditLog> findByRowIdAndTable(
            @Param("rowId") Long rowId,
            @Param("tableName") String tableName);
}
