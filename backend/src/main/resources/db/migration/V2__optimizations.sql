-- ==========================================================================
-- V2: Database Optimizations — Triggers, Functions, and Indexes
-- ==========================================================================

-- ---------- Indexes ----------

-- Speed up submission queries by problem, user, and status
CREATE INDEX IF NOT EXISTS idx_submissions_problem_user_status
ON submissions (problem_id, user_id, status);

-- Speed up contest-problem lookups
CREATE INDEX IF NOT EXISTS idx_contest_problems_problem_id
ON contest_problems (problem_id);

-- Speed up published problem filtering
CREATE INDEX IF NOT EXISTS idx_problems_published
ON problems (published);

-- Speed up tag filtering
CREATE INDEX IF NOT EXISTS idx_problem_tags_tags
ON problem_tags (tags);


-- ---------- Trigger: Auto-update solve_count ----------
-- When a submission with ACCEPTED status is inserted, increment the problem's
-- solve_count only if this is the user's first accepted submission for that problem.

CREATE OR REPLACE FUNCTION fn_update_solve_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACCEPTED' THEN
        -- Only increment if no prior ACCEPTED submission from this user for this problem
        IF NOT EXISTS (
            SELECT 1 FROM submissions
            WHERE problem_id = NEW.problem_id
              AND user_id = NEW.user_id
              AND status = 'ACCEPTED'
              AND id != NEW.id
        ) THEN
            UPDATE problems
            SET solve_count = solve_count + 1
            WHERE id = NEW.problem_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_solve_count ON submissions;
CREATE TRIGGER trg_update_solve_count
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION fn_update_solve_count();


-- ---------- Function: Get user statistics ----------
-- Single query to get total submissions, solved problems, and accuracy

CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id BIGINT)
RETURNS TABLE(
    total_submissions BIGINT,
    solved_problems BIGINT,
    accepted_submissions BIGINT,
    accuracy NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_submissions,
        COUNT(DISTINCT CASE WHEN s.status = 'ACCEPTED' THEN s.problem_id END)::BIGINT AS solved_problems,
        COUNT(CASE WHEN s.status = 'ACCEPTED' THEN 1 END)::BIGINT AS accepted_submissions,
        CASE
            WHEN COUNT(*) > 0
            THEN ROUND(COUNT(CASE WHEN s.status = 'ACCEPTED' THEN 1 END)::NUMERIC * 100 / COUNT(*)::NUMERIC, 2)
            ELSE 0.00
        END AS accuracy
    FROM submissions s
    WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- ---------- Function: Get problem statistics ----------
-- Returns submission count, accepted count, and acceptance rate for a problem

CREATE OR REPLACE FUNCTION get_problem_statistics(p_problem_id BIGINT)
RETURNS TABLE(
    total_submissions BIGINT,
    accepted_submissions BIGINT,
    unique_solvers BIGINT,
    acceptance_rate NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_submissions,
        COUNT(CASE WHEN s.status = 'ACCEPTED' THEN 1 END)::BIGINT AS accepted_submissions,
        COUNT(DISTINCT CASE WHEN s.status = 'ACCEPTED' THEN s.user_id END)::BIGINT AS unique_solvers,
        CASE
            WHEN COUNT(*) > 0
            THEN ROUND(COUNT(CASE WHEN s.status = 'ACCEPTED' THEN 1 END)::NUMERIC * 100 / COUNT(*)::NUMERIC, 2)
            ELSE 0.00
        END AS acceptance_rate
    FROM submissions s
    WHERE s.problem_id = p_problem_id;
END;
$$ LANGUAGE plpgsql;


-- ---------- Function: Check if problem is visible ----------
-- A problem is visible if published=true OR it exists in contest_problems

CREATE OR REPLACE FUNCTION is_problem_visible(p_problem_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_published BOOLEAN;
    v_in_contest BOOLEAN;
BEGIN
    SELECT published INTO v_published FROM problems WHERE id = p_problem_id;
    IF v_published IS NULL THEN
        RETURN FALSE;
    END IF;
    IF v_published THEN
        RETURN TRUE;
    END IF;
    SELECT EXISTS(SELECT 1 FROM contest_problems WHERE problem_id = p_problem_id) INTO v_in_contest;
    RETURN v_in_contest;
END;
$$ LANGUAGE plpgsql;
