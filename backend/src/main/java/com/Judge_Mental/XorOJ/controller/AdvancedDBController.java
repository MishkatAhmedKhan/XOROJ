package com.Judge_Mental.XorOJ.controller;

import com.Judge_Mental.XorOJ.dto.*;
import com.Judge_Mental.XorOJ.entity.AuditLog;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.repo.XUserRepository;
import com.Judge_Mental.XorOJ.service.AdvancedDBService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller exposing all advanced database features.
 */
@RestController
@RequestMapping("/api/db")
public class AdvancedDBController {

    @Autowired
    private AdvancedDBService dbService;

    @Autowired
    private XUserRepository userRepo;

    // ── Feature 1: Audit Log ───────────────────────────────────────────────

    /**
     * GET /api/db/audit?page=0&size=20&table=submissions&operation=UPDATE
     * Paginated audit log with optional filters.
     */
    @GetMapping("/audit")
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String table,
            @RequestParam(required = false) String operation) {

        Page<AuditLog> result = dbService.getAuditLogs(page, size, table, operation);

        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalPages", result.getTotalPages());
        response.put("totalElements", result.getTotalElements());
        response.put("currentPage", page);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/db/audit/history?table=submissions&rowId=5
     * Full change history for a specific entity row.
     */
    @GetMapping("/audit/history")
    public ResponseEntity<List<AuditLog>> getEntityHistory(
            @RequestParam String table,
            @RequestParam Long rowId) {
        return ResponseEntity.ok(dbService.getEntityHistory(table, rowId));
    }

    // ── Feature 2: User Statistics ─────────────────────────────────────────

    /**
     * GET /api/db/stats/user/{username}
     * Returns aggregated statistics from the materialized view.
     */
    @GetMapping("/stats/user/{username}")
    public ResponseEntity<?> getUserStatistics(@PathVariable String username) {
        UserStatisticsDTO stats = dbService.getUserStatisticsByUsername(username);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/db/stats/me
     * Returns the current user's statistics.
     */
    @GetMapping("/stats/me")
    public ResponseEntity<?> getMyStatistics(@AuthenticationPrincipal UserDetails userDetails) {
        XUser user = userRepo.findByUsername(userDetails.getUsername());
        if (user == null) return ResponseEntity.notFound().build();
        UserStatisticsDTO stats = dbService.getUserStatistics(user.getId());
        if (stats == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(stats);
    }

    // ── Feature 4: Global Leaderboard ──────────────────────────────────────

    /**
     * GET /api/db/leaderboard?page=0&size=50
     * Returns ranked users using DENSE_RANK() window function.
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(dbService.getLeaderboard(page, size));
    }

    // ── Feature 5: Submission Analytics ────────────────────────────────────

    /**
     * GET /api/db/analytics/{username}
     * Verdict distribution computed by cursor-based stored function.
     */
    @GetMapping("/analytics/{username}")
    public ResponseEntity<?> getSubmissionAnalytics(@PathVariable String username) {
        XUser user = userRepo.findByUsername(username);
        if (user == null) return ResponseEntity.notFound().build();
        List<VerdictAnalyticsDTO> analytics = dbService.getSubmissionAnalytics(user.getId());
        return ResponseEntity.ok(analytics);
    }

    // ── Feature 6: Activity Heatmap ────────────────────────────────────────

    /**
     * GET /api/db/heatmap/{username}
     * Daily activity data for the past year using generate_series.
     */
    @GetMapping("/heatmap/{username}")
    public ResponseEntity<?> getActivityHeatmap(@PathVariable String username) {
        XUser user = userRepo.findByUsername(username);
        if (user == null) return ResponseEntity.notFound().build();
        List<ActivityHeatmapDTO> heatmap = dbService.getActivityHeatmap(user.getId());
        return ResponseEntity.ok(heatmap);
    }

    // ── Feature 7: Problem Recommendations ─────────────────────────────────

    /**
     * GET /api/db/recommendations?limit=10
     * Tag-based problem recommendations using cursor-based stored function.
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<ProblemRecommendationDTO>> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int limit) {
        XUser user = userRepo.findByUsername(userDetails.getUsername());
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dbService.getRecommendations(user.getId(), limit));
    }

    // ── Feature 8: Contest Performance ─────────────────────────────────────

    /**
     * GET /api/db/contest-performance/{username}
     * Per-contest stats computed by cursor-based stored function.
     */
    @GetMapping("/contest-performance/{username}")
    public ResponseEntity<?> getContestPerformance(@PathVariable String username) {
        XUser user = userRepo.findByUsername(username);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dbService.getContestPerformance(user.getId()));
    }

    // ── Feature 10: Platform Dashboard Stats ───────────────────────────────

    /**
     * GET /api/db/platform-stats
     * System-wide statistics from stored function.
     */
    @GetMapping("/platform-stats")
    public ResponseEntity<PlatformStatsDTO> getPlatformStats() {
        PlatformStatsDTO stats = dbService.getPlatformStats();
        if (stats == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(stats);
    }

    // ── Materialized View Refresh (admin action) ───────────────────────────

    /**
     * POST /api/db/refresh-stats
     * Manually refreshes the user statistics materialized view.
     */
    @PostMapping("/refresh-stats")
    public ResponseEntity<String> refreshStats() {
        dbService.refreshUserStatistics();
        return ResponseEntity.ok("User statistics materialized view refreshed.");
    }
}
