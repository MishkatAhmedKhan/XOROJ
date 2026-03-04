-- ============================================================================
-- XorOJ Advanced Database Migration Script
-- Features: Triggers, Cursors, Stored Functions, Views, Indexes, Window Fns
-- Target: PostgreSQL 14+
-- ============================================================================

-- ============================================================================
-- FEATURE 1: AUDIT TRAIL TRIGGERS
-- Automatically logs INSERT/UPDATE/DELETE on key tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL PRIMARY KEY,
    table_name      VARCHAR(100)  NOT NULL,
    operation       VARCHAR(10)   NOT NULL,  -- INSERT, UPDATE, DELETE
    row_id          BIGINT,
    old_data        JSONB,
    new_data        JSONB,
    changed_by      VARCHAR(255),
    changed_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table     ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation  ON audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_row_id     ON audit_log(row_id);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(table_name, operation, row_id, new_data, changed_at)
        VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(table_name, operation, row_id, old_data, new_data, changed_at)
        VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, to_jsonb(OLD), to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(table_name, operation, row_id, old_data, changed_at)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, to_jsonb(OLD), NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to key tables
DROP TRIGGER IF EXISTS trg_audit_submissions ON submissions;
CREATE TRIGGER trg_audit_submissions
    AFTER INSERT OR UPDATE OR DELETE ON submissions
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_problems ON problems;
CREATE TRIGGER trg_audit_problems
    AFTER INSERT OR UPDATE OR DELETE ON problems
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

DROP TRIGGER IF EXISTS trg_audit_contest ON contest;
CREATE TRIGGER trg_audit_contest
    AFTER INSERT OR UPDATE OR DELETE ON contest
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();


-- ============================================================================
-- FEATURE 2: USER STATISTICS MATERIALIZED VIEW
-- Precomputed user stats for fast profile & leaderboard queries
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_user_statistics;
CREATE MATERIALIZED VIEW mv_user_statistics AS
SELECT
    u.id                                            AS user_id,
    u.username                                      AS username,
    u.first_name                                    AS first_name,
    u.last_name                                     AS last_name,
    COUNT(s.id)                                     AS total_submissions,
    COUNT(s.id) FILTER (WHERE s.status = 'ACCEPTED')   AS accepted_count,
    COUNT(DISTINCT s.problem_id) FILTER (WHERE s.status = 'ACCEPTED') AS problems_solved,
    CASE
        WHEN COUNT(s.id) > 0
        THEN ROUND(100.0 * COUNT(s.id) FILTER (WHERE s.status = 'ACCEPTED') / COUNT(s.id), 2)
        ELSE 0
    END                                             AS acceptance_rate,
    COUNT(DISTINCT s.contest_id) FILTER (WHERE s.contest_id IS NOT NULL) AS contests_participated,
    MAX(s.submission_time)                          AS last_submission_at
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.username, u.first_name, u.last_name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_stats_uid ON mv_user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_mv_user_stats_solved ON mv_user_statistics(problems_solved DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION fn_refresh_user_statistics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_statistics;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FEATURE 3: AUTO-UPDATE solve_count VIA TRIGGER
-- When a submission verdict changes to/from ACCEPTED, update problems.solve_count
-- Uses DISTINCT user tracking to avoid double-counting
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_update_solve_count()
RETURNS TRIGGER AS $$
DECLARE
    v_problem_id BIGINT;
    v_new_count  INTEGER;
BEGIN
    -- Determine which problem to recount
    IF TG_OP = 'DELETE' THEN
        v_problem_id := OLD.problem_id;
    ELSE
        v_problem_id := NEW.problem_id;
    END IF;

    -- Only act if the status involves ACCEPTED
    IF TG_OP = 'INSERT' AND NEW.status = 'ACCEPTED' THEN
        -- recount
        NULL;
    ELSIF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status)
          AND (OLD.status = 'ACCEPTED' OR NEW.status = 'ACCEPTED') THEN
        NULL;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACCEPTED' THEN
        NULL;
    ELSE
        -- No ACCEPTED status involved, skip
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Count distinct users who have at least one ACCEPTED submission for this problem
    SELECT COUNT(DISTINCT user_id) INTO v_new_count
    FROM submissions
    WHERE problem_id = v_problem_id AND status = 'ACCEPTED';

    UPDATE problems SET solve_count = v_new_count WHERE id = v_problem_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_solve_count ON submissions;
CREATE TRIGGER trg_update_solve_count
    AFTER INSERT OR UPDATE OF status OR DELETE ON submissions
    FOR EACH ROW EXECUTE FUNCTION fn_update_solve_count();


-- ============================================================================
-- FEATURE 4: GLOBAL LEADERBOARD WITH WINDOW FUNCTIONS
-- Stored function returning ranked users
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_global_leaderboard(
    p_limit  INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    rank           BIGINT,
    user_id        BIGINT,
    username       VARCHAR,
    first_name     VARCHAR,
    last_name      VARCHAR,
    problems_solved BIGINT,
    accepted_count BIGINT,
    total_submissions BIGINT,
    acceptance_rate NUMERIC,
    contests_participated BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DENSE_RANK() OVER (
            ORDER BY mv.problems_solved DESC, mv.acceptance_rate DESC, mv.total_submissions ASC
        )::BIGINT                   AS rank,
        mv.user_id,
        mv.username,
        mv.first_name,
        mv.last_name,
        mv.problems_solved,
        mv.accepted_count,
        mv.total_submissions,
        mv.acceptance_rate,
        mv.contests_participated
    FROM mv_user_statistics mv
    WHERE mv.total_submissions > 0
    ORDER BY rank, mv.username
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FEATURE 5: SUBMISSION ANALYTICS WITH CURSOR-BASED FUNCTION
-- Uses a CURSOR to iterate over a user's submissions and build verdict stats
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_user_submission_analytics(p_user_id BIGINT)
RETURNS TABLE (
    verdict            VARCHAR,
    count              BIGINT,
    percentage         NUMERIC,
    avg_execution_time NUMERIC,
    avg_memory_used    NUMERIC
) AS $$
DECLARE
    cur_verdicts CURSOR FOR
        SELECT
            s.status::VARCHAR           AS verdict,
            COUNT(*)                    AS cnt,
            AVG(s.execution_time)       AS avg_exec,
            AVG(s.memory_used)          AS avg_mem
        FROM submissions s
        WHERE s.user_id = p_user_id
        GROUP BY s.status
        ORDER BY COUNT(*) DESC;

    rec           RECORD;
    total_count   BIGINT;
BEGIN
    -- Get total count first
    SELECT COUNT(*) INTO total_count FROM submissions WHERE user_id = p_user_id;

    IF total_count = 0 THEN
        RETURN;
    END IF;

    -- Use cursor to iterate and return results
    OPEN cur_verdicts;
    LOOP
        FETCH cur_verdicts INTO rec;
        EXIT WHEN NOT FOUND;

        verdict            := rec.verdict;
        count              := rec.cnt;
        percentage         := ROUND(100.0 * rec.cnt / total_count, 2);
        avg_execution_time := ROUND(COALESCE(rec.avg_exec, 0), 2);
        avg_memory_used    := ROUND(COALESCE(rec.avg_mem, 0), 2);

        RETURN NEXT;
    END LOOP;
    CLOSE cur_verdicts;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FEATURE 6: DAILY ACTIVITY HEATMAP
-- Uses generate_series to produce a full date range, LEFT JOINed with submissions
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_user_activity_heatmap(
    p_user_id   BIGINT,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '365 days',
    p_end_date   DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    activity_date   DATE,
    submission_count BIGINT,
    accepted_count   BIGINT,
    intensity_level  INTEGER   -- 0-4 like GitHub
) AS $$
DECLARE
    max_daily BIGINT;
BEGIN
    -- Find the max daily submission count for scaling
    SELECT COALESCE(MAX(cnt), 1) INTO max_daily
    FROM (
        SELECT COUNT(*) AS cnt
        FROM submissions
        WHERE user_id = p_user_id
          AND submission_time::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY submission_time::DATE
    ) sub;

    RETURN QUERY
    SELECT
        d.dt::DATE                                              AS activity_date,
        COALESCE(COUNT(s.id), 0)                                AS submission_count,
        COALESCE(COUNT(s.id) FILTER (WHERE s.status = 'ACCEPTED'), 0) AS accepted_count,
        CASE
            WHEN COUNT(s.id) = 0 THEN 0
            WHEN COUNT(s.id) <= max_daily * 0.25 THEN 1
            WHEN COUNT(s.id) <= max_daily * 0.50 THEN 2
            WHEN COUNT(s.id) <= max_daily * 0.75 THEN 3
            ELSE 4
        END::INTEGER                                            AS intensity_level
    FROM generate_series(p_start_date::TIMESTAMP, p_end_date::TIMESTAMP, '1 day') AS d(dt)
    LEFT JOIN submissions s
        ON s.user_id = p_user_id AND s.submission_time::DATE = d.dt::DATE
    GROUP BY d.dt
    ORDER BY d.dt;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FEATURE 7: TAG-BASED PROBLEM RECOMMENDATIONS (uses cursor)
-- Analyzes which tags a user has solved, recommends unsolved problems with those tags
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_recommend_problems(
    p_user_id BIGINT,
    p_limit   INTEGER DEFAULT 10
)
RETURNS TABLE (
    problem_id        BIGINT,
    title             VARCHAR,
    difficulty_rating INTEGER,
    solve_count       INTEGER,
    matching_tags     BIGINT,
    relevance_score   NUMERIC
) AS $$
DECLARE
    cur_problems CURSOR FOR
        WITH solved_problems AS (
            -- Problems this user has solved (ACCEPTED)
            SELECT DISTINCT s.problem_id AS pid
            FROM submissions s
            WHERE s.user_id = p_user_id AND s.status = 'ACCEPTED'
        ),
        user_tags AS (
            -- Tags from problems the user solved
            SELECT DISTINCT pt.tags AS tag
            FROM solved_problems sp
            JOIN problem_tags pt ON pt.problem_id = sp.pid
        ),
        candidate_problems AS (
            -- Unsolved public problems
            SELECT p.id AS cid, p.title AS ctitle, p.difficulty_rating AS cdiff, p.solve_count AS csolve
            FROM problems p
            WHERE p.status = 'public'
              AND p.id NOT IN (SELECT sp2.pid FROM solved_problems sp2)
        ),
        scored AS (
            SELECT
                cp.cid          AS sid,
                cp.ctitle       AS stitle,
                cp.cdiff        AS sdiff,
                cp.csolve       AS ssolve,
                COUNT(ut.tag)   AS smatching,
                (COUNT(ut.tag) * 10.0 +
                 CASE
                     WHEN cp.cdiff BETWEEN 800 AND 1600 THEN 5
                     WHEN cp.cdiff BETWEEN 1600 AND 2400 THEN 3
                     ELSE 1
                 END +
                 LEAST(cp.csolve, 100) / 20.0
                )               AS srelevance
            FROM candidate_problems cp
            LEFT JOIN problem_tags pt ON pt.problem_id = cp.cid
            LEFT JOIN user_tags ut ON ut.tag = pt.tags
            GROUP BY cp.cid, cp.ctitle, cp.cdiff, cp.csolve
        )
        SELECT sid, stitle, sdiff, ssolve, smatching, srelevance
        FROM scored ORDER BY srelevance DESC, smatching DESC
        LIMIT p_limit;

    rec RECORD;
BEGIN
    OPEN cur_problems;
    LOOP
        FETCH cur_problems INTO rec;
        EXIT WHEN NOT FOUND;

        problem_id        := rec.sid;
        title             := rec.stitle;
        difficulty_rating := rec.sdiff;
        solve_count       := rec.ssolve;
        matching_tags     := rec.smatching;
        relevance_score   := ROUND(rec.srelevance, 2);

        RETURN NEXT;
    END LOOP;
    CLOSE cur_problems;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FEATURE 8: CONTEST PERFORMANCE SUMMARY WITH CURSOR
-- Iterates over a user's contest participations and computes stats per contest
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_user_contest_performance(p_user_id BIGINT)
RETURNS TABLE (
    contest_id          BIGINT,
    contest_title       VARCHAR,
    total_problems      BIGINT,
    problems_attempted  BIGINT,
    problems_solved     BIGINT,
    total_submissions   BIGINT,
    best_rank           BIGINT,
    solve_percentage    NUMERIC
) AS $$
DECLARE
    cur_contests CURSOR FOR
        SELECT DISTINCT c.id AS cid, c.title AS ctitle
        FROM contest c
        JOIN contest_participants cp ON cp.contest_id = c.id
        WHERE cp.user_id = p_user_id
        ORDER BY c.id DESC;
    rec RECORD;
    v_total_problems    BIGINT;
    v_attempted         BIGINT;
    v_solved            BIGINT;
    v_sub_count         BIGINT;
BEGIN
    OPEN cur_contests;
    LOOP
        FETCH cur_contests INTO rec;
        EXIT WHEN NOT FOUND;

        -- Count total problems in this contest
        SELECT COUNT(*) INTO v_total_problems
        FROM contest_problems cpb WHERE cpb.contest_id = rec.cid;

        -- Count problems attempted by user
        SELECT COUNT(DISTINCT s.problem_id) INTO v_attempted
        FROM submissions s
        WHERE s.user_id = p_user_id AND s.contest_id = rec.cid;

        -- Count problems solved
        SELECT COUNT(DISTINCT s.problem_id) INTO v_solved
        FROM submissions s
        WHERE s.user_id = p_user_id AND s.contest_id = rec.cid AND s.status = 'ACCEPTED';

        -- Total submissions
        SELECT COUNT(*) INTO v_sub_count
        FROM submissions s
        WHERE s.user_id = p_user_id AND s.contest_id = rec.cid;

        contest_id          := rec.cid;
        contest_title       := rec.ctitle;
        total_problems      := v_total_problems;
        problems_attempted  := v_attempted;
        problems_solved     := v_solved;
        total_submissions   := v_sub_count;
        best_rank           := NULL;  -- Can be computed from standings_snapshot
        solve_percentage    := CASE WHEN v_total_problems > 0
                                 THEN ROUND(100.0 * v_solved / v_total_problems, 2)
                                 ELSE 0 END;

        RETURN NEXT;
    END LOOP;
    CLOSE cur_contests;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FEATURE 9: COMPOSITE & PARTIAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Submissions: fast lookup by user + status
CREATE INDEX IF NOT EXISTS idx_submissions_user_status
    ON submissions(user_id, status);

-- Submissions: fast contest queries
CREATE INDEX IF NOT EXISTS idx_submissions_contest_time
    ON submissions(contest_id, submission_time DESC);

-- Submissions: partial index for ACCEPTED only (most common filter)
CREATE INDEX IF NOT EXISTS idx_submissions_accepted
    ON submissions(problem_id, user_id)
    WHERE status = 'ACCEPTED';

-- Submissions: covering index for pagination queries
CREATE INDEX IF NOT EXISTS idx_submissions_contest_page
    ON submissions(contest_id, submission_time DESC)
    INCLUDE (user_id, problem_id, status, execution_time, memory_used);

-- Problems: public problems sorted by difficulty
CREATE INDEX IF NOT EXISTS idx_problems_public_diff
    ON problems(difficulty_rating, solve_count DESC)
    WHERE status = 'public';

-- Problems: tag search optimization
-- Try to enable pg_trgm for GIN index, fall back to B-tree if unavailable
DO $$ BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS idx_problem_tags_gin
        ON problem_tags USING GIN (tags gin_trgm_ops);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm not available, using B-tree index instead';
END $$;
CREATE INDEX IF NOT EXISTS idx_problem_tags_btree
    ON problem_tags(tags, problem_id);

-- Users: username lookup (likely already indexed via unique constraint)
-- Contest participants: fast registration check
CREATE INDEX IF NOT EXISTS idx_contest_participants
    ON contest_participants(user_id, contest_id);

-- Audit log: composite for filtered queries
CREATE INDEX IF NOT EXISTS idx_audit_composite
    ON audit_log(table_name, changed_at DESC);


-- ============================================================================
-- FEATURE 10: PLATFORM DASHBOARD STATISTICS
-- Stored function that computes system-wide stats
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_platform_stats()
RETURNS TABLE (
    total_users          BIGINT,
    total_problems       BIGINT,
    total_submissions    BIGINT,
    total_contests       BIGINT,
    submissions_today    BIGINT,
    submissions_this_week BIGINT,
    active_contests      BIGINT,
    avg_acceptance_rate  NUMERIC,
    most_solved_problem_id   BIGINT,
    most_solved_problem_title VARCHAR,
    most_active_user_id      BIGINT,
    most_active_username     VARCHAR
) AS $$
DECLARE
    v_total_users       BIGINT;
    v_total_problems    BIGINT;
    v_total_submissions BIGINT;
    v_total_contests    BIGINT;
    v_today             BIGINT;
    v_week              BIGINT;
    v_active            BIGINT;
    v_avg_rate          NUMERIC;
    v_top_problem_id    BIGINT;
    v_top_problem_title VARCHAR;
    v_top_user_id       BIGINT;
    v_top_username      VARCHAR;
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM users;
    SELECT COUNT(*) INTO v_total_problems FROM problems WHERE status = 'public';
    SELECT COUNT(*) INTO v_total_submissions FROM submissions;
    SELECT COUNT(*) INTO v_total_contests FROM contest;

    SELECT COUNT(*) INTO v_today
    FROM submissions
    WHERE submission_time::DATE = CURRENT_DATE;

    SELECT COUNT(*) INTO v_week
    FROM submissions
    WHERE submission_time >= CURRENT_DATE - INTERVAL '7 days';

    SELECT COUNT(*) INTO v_active
    FROM contest
    WHERE start_time <= NOW() AND end_time >= NOW();

    SELECT COALESCE(ROUND(AVG(mv.acceptance_rate), 2), 0) INTO v_avg_rate
    FROM mv_user_statistics mv
    WHERE mv.total_submissions > 0;

    SELECT p.id, p.title INTO v_top_problem_id, v_top_problem_title
    FROM problems p WHERE p.status = 'public'
    ORDER BY p.solve_count DESC LIMIT 1;

    SELECT u.id, u.username INTO v_top_user_id, v_top_username
    FROM users u
    JOIN (SELECT user_id, COUNT(*) AS cnt FROM submissions GROUP BY user_id ORDER BY cnt DESC LIMIT 1) s
    ON u.id = s.user_id;

    total_users           := v_total_users;
    total_problems        := v_total_problems;
    total_submissions     := v_total_submissions;
    total_contests        := v_total_contests;
    submissions_today     := v_today;
    submissions_this_week := v_week;
    active_contests       := v_active;
    avg_acceptance_rate   := v_avg_rate;
    most_solved_problem_id    := v_top_problem_id;
    most_solved_problem_title := v_top_problem_title;
    most_active_user_id       := v_top_user_id;
    most_active_username      := v_top_username;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- HELPER: Trigger to auto-refresh materialized view after submission changes
-- (Debounced — only refreshes if last refresh was > 30 seconds ago)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mv_refresh_tracker (
    view_name   VARCHAR(100) PRIMARY KEY,
    last_refresh TIMESTAMP NOT NULL DEFAULT '1970-01-01'
);

INSERT INTO mv_refresh_tracker(view_name, last_refresh)
VALUES ('mv_user_statistics', '1970-01-01')
ON CONFLICT (view_name) DO NOTHING;

CREATE OR REPLACE FUNCTION fn_maybe_refresh_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_last TIMESTAMP;
BEGIN
    SELECT last_refresh INTO v_last
    FROM mv_refresh_tracker
    WHERE view_name = 'mv_user_statistics';

    -- Only refresh if more than 30 seconds have passed
    IF v_last IS NULL OR (NOW() - v_last) > INTERVAL '30 seconds' THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_statistics;
        UPDATE mv_refresh_tracker
        SET last_refresh = NOW()
        WHERE view_name = 'mv_user_statistics';
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_user_stats ON submissions;
CREATE TRIGGER trg_refresh_user_stats
    AFTER INSERT OR UPDATE OF status OR DELETE ON submissions
    FOR EACH STATEMENT EXECUTE FUNCTION fn_maybe_refresh_user_stats();


-- ============================================================================
-- Initial materialized view refresh
-- ============================================================================
REFRESH MATERIALIZED VIEW mv_user_statistics;

-- Done!
SELECT 'All 10 database features installed successfully.' AS result;