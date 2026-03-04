package com.Judge_Mental.XorOJ.repo;

import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.dto.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.util.ArrayList;
import java.util.List;

/**
 * Repository for calling stored functions and reading materialized views.
 * Uses native queries since these are PostgreSQL-specific database objects.
 */
@Repository
public class AdvancedDBRepository {

    @PersistenceContext
    private EntityManager em;

    // ── Feature 2: User Statistics from Materialized View ──────────────────

    public UserStatisticsDTO getUserStatistics(Long userId) {
        Query q = em.createNativeQuery(
            "SELECT user_id, username, first_name, last_name, " +
            "total_submissions, accepted_count, problems_solved, " +
            "acceptance_rate, contests_participated, " +
            "CAST(last_submission_at AS VARCHAR) " +
            "FROM mv_user_statistics WHERE user_id = :uid");
        q.setParameter("uid", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        if (rows.isEmpty()) return null;

        Object[] r = rows.get(0);
        return new UserStatisticsDTO(
            toLong(r[0]), str(r[1]), str(r[2]), str(r[3]),
            toLong(r[4]), toLong(r[5]), toLong(r[6]),
            toDouble(r[7]), toLong(r[8]), str(r[9])
        );
    }

    public UserStatisticsDTO getUserStatisticsByUsername(String username) {
        Query q = em.createNativeQuery(
            "SELECT user_id, username, first_name, last_name, " +
            "total_submissions, accepted_count, problems_solved, " +
            "acceptance_rate, contests_participated, " +
            "CAST(last_submission_at AS VARCHAR) " +
            "FROM mv_user_statistics WHERE username = :uname");
        q.setParameter("uname", username);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        if (rows.isEmpty()) return null;

        Object[] r = rows.get(0);
        return new UserStatisticsDTO(
            toLong(r[0]), str(r[1]), str(r[2]), str(r[3]),
            toLong(r[4]), toLong(r[5]), toLong(r[6]),
            toDouble(r[7]), toLong(r[8]), str(r[9])
        );
    }

    // ── Feature 4: Global Leaderboard ──────────────────────────────────────

    public List<LeaderboardEntryDTO> getLeaderboard(int limit, int offset) {
        Query q = em.createNativeQuery(
            "SELECT * FROM fn_global_leaderboard(:lim, :off)");
        q.setParameter("lim", limit);
        q.setParameter("off", offset);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<LeaderboardEntryDTO> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(new LeaderboardEntryDTO(
                toLong(r[0]), toLong(r[1]), str(r[2]), str(r[3]), str(r[4]),
                toLong(r[5]), toLong(r[6]), toLong(r[7]),
                toDouble(r[8]), toLong(r[9])
            ));
        }
        return result;
    }

    // ── Feature 5: Submission Analytics (cursor-based function) ────────────

    public List<VerdictAnalyticsDTO> getSubmissionAnalytics(Long userId) {
        Query q = em.createNativeQuery(
            "SELECT * FROM fn_user_submission_analytics(:uid)");
        q.setParameter("uid", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<VerdictAnalyticsDTO> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(new VerdictAnalyticsDTO(
                str(r[0]), toLong(r[1]), toDouble(r[2]),
                toDouble(r[3]), toDouble(r[4])
            ));
        }
        return result;
    }

    // ── Feature 6: Activity Heatmap ────────────────────────────────────────

    public List<ActivityHeatmapDTO> getActivityHeatmap(Long userId) {
        Query q = em.createNativeQuery(
            "SELECT * FROM fn_user_activity_heatmap(:uid)");
        q.setParameter("uid", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<ActivityHeatmapDTO> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(new ActivityHeatmapDTO(
                str(r[0]), toLong(r[1]), toLong(r[2]), toInt(r[3])
            ));
        }
        return result;
    }

    // ── Feature 7: Problem Recommendations (cursor-based function) ────────

    public List<ProblemRecommendationDTO> getRecommendations(Long userId, int limit) {
        Query q = em.createNativeQuery(
            "SELECT * FROM fn_recommend_problems(:uid, :lim)");
        q.setParameter("uid", userId);
        q.setParameter("lim", limit);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<ProblemRecommendationDTO> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(new ProblemRecommendationDTO(
                toLong(r[0]), str(r[1]), toInt(r[2]), toInt(r[3]),
                toLong(r[4]), toDouble(r[5])
            ));
        }
        return result;
    }

    // ── Feature 8: Contest Performance (cursor-based function) ─────────────

    public List<ContestPerformanceDTO> getContestPerformance(Long userId) {
        Query q = em.createNativeQuery(
            "SELECT * FROM fn_user_contest_performance(:uid)");
        q.setParameter("uid", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        List<ContestPerformanceDTO> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(new ContestPerformanceDTO(
                toLong(r[0]), str(r[1]), toLong(r[2]), toLong(r[3]),
                toLong(r[4]), toLong(r[5]), toLong(r[6]), toDouble(r[7])
            ));
        }
        return result;
    }

    // ── Feature 10: Platform Stats ─────────────────────────────────────────

    public PlatformStatsDTO getPlatformStats() {
        Query q = em.createNativeQuery("SELECT * FROM fn_platform_stats()");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = q.getResultList();
        if (rows.isEmpty()) return null;

        Object[] r = rows.get(0);
        return new PlatformStatsDTO(
            toLong(r[0]), toLong(r[1]), toLong(r[2]), toLong(r[3]),
            toLong(r[4]), toLong(r[5]), toLong(r[6]),
            toDouble(r[7]),
            toLong(r[8]), str(r[9]),
            toLong(r[10]), str(r[11])
        );
    }

    // ── Refresh materialized view ──────────────────────────────────────────

    public void refreshUserStatistics() {
        em.createNativeQuery("SELECT fn_refresh_user_statistics()").getSingleResult();
    }

    // ── Utility methods ────────────────────────────────────────────────────

    private Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        return Long.parseLong(o.toString());
    }

    private Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.intValue();
        return Integer.parseInt(o.toString());
    }

    private Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.doubleValue();
        return Double.parseDouble(o.toString());
    }

    private String str(Object o) {
        return o == null ? null : o.toString();
    }
}
