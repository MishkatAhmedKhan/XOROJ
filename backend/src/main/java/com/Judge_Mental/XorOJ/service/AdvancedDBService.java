package com.Judge_Mental.XorOJ.service;

import com.Judge_Mental.XorOJ.dto.*;
import com.Judge_Mental.XorOJ.entity.AuditLog;
import com.Judge_Mental.XorOJ.repo.AdvancedDBRepository;
import com.Judge_Mental.XorOJ.repo.AuditLogRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for all advanced database features.
 * Coordinates calls to stored functions, materialized views, and audit log queries.
 */
@Service
public class AdvancedDBService {

    @Autowired
    private AdvancedDBRepository advancedDBRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    // ── Feature 1: Audit Log ───────────────────────────────────────────────

    public Page<AuditLog> getAuditLogs(int page, int size, String tableName, String operation) {
        PageRequest pageable = PageRequest.of(page, size);

        if (tableName != null && operation != null) {
            return auditLogRepo.findByTableNameAndOperationOrderByChangedAtDesc(
                    tableName, operation, pageable);
        } else if (tableName != null) {
            return auditLogRepo.findByTableNameOrderByChangedAtDesc(tableName, pageable);
        } else if (operation != null) {
            return auditLogRepo.findByOperationOrderByChangedAtDesc(operation, pageable);
        }
        return auditLogRepo.findAllByOrderByChangedAtDesc(pageable);
    }

    public List<AuditLog> getEntityHistory(String tableName, Long rowId) {
        return auditLogRepo.findByRowIdAndTable(rowId, tableName);
    }

    // ── Feature 2: User Statistics ─────────────────────────────────────────

    public UserStatisticsDTO getUserStatistics(Long userId) {
        return advancedDBRepo.getUserStatistics(userId);
    }

    public UserStatisticsDTO getUserStatisticsByUsername(String username) {
        return advancedDBRepo.getUserStatisticsByUsername(username);
    }

    // ── Feature 4: Global Leaderboard ──────────────────────────────────────

    public List<LeaderboardEntryDTO> getLeaderboard(int page, int size) {
        return advancedDBRepo.getLeaderboard(size, page * size);
    }

    // ── Feature 5: Submission Analytics ────────────────────────────────────

    public List<VerdictAnalyticsDTO> getSubmissionAnalytics(Long userId) {
        return advancedDBRepo.getSubmissionAnalytics(userId);
    }

    // ── Feature 6: Activity Heatmap ────────────────────────────────────────

    public List<ActivityHeatmapDTO> getActivityHeatmap(Long userId) {
        return advancedDBRepo.getActivityHeatmap(userId);
    }

    // ── Feature 7: Problem Recommendations ─────────────────────────────────

    public List<ProblemRecommendationDTO> getRecommendations(Long userId, int limit) {
        return advancedDBRepo.getRecommendations(userId, limit);
    }

    // ── Feature 8: Contest Performance ─────────────────────────────────────

    public List<ContestPerformanceDTO> getContestPerformance(Long userId) {
        return advancedDBRepo.getContestPerformance(userId);
    }

    // ── Feature 10: Platform Stats ─────────────────────────────────────────

    public PlatformStatsDTO getPlatformStats() {
        return advancedDBRepo.getPlatformStats();
    }

    // ── Materialized View Refresh ──────────────────────────────────────────

    @Transactional
    public void refreshUserStatistics() {
        advancedDBRepo.refreshUserStatistics();
    }
}
