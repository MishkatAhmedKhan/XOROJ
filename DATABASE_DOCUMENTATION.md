# XorOJ Database Documentation

## Table of Contents

1. [Overview](#overview)
2. [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Table Schemas](#table-schemas)
4. [Relationships](#relationships)
5. [Advanced Database Features](#advanced-database-features)
   - [Feature 1: Audit Trail Triggers](#feature-1-audit-trail-triggers)
   - [Feature 2: User Statistics Materialized View](#feature-2-user-statistics-materialized-view)
   - [Feature 3: Auto-update solve_count via Trigger](#feature-3-auto-update-solve_count-via-trigger)
   - [Feature 4: Global Leaderboard with Window Functions](#feature-4-global-leaderboard-with-window-functions)
   - [Feature 5: Submission Analytics with Cursor](#feature-5-submission-analytics-with-cursor)
   - [Feature 6: Daily Activity Heatmap](#feature-6-daily-activity-heatmap)
   - [Feature 7: Tag-based Problem Recommendations](#feature-7-tag-based-problem-recommendations)
   - [Feature 8: Contest Performance Summary with Cursor](#feature-8-contest-performance-summary-with-cursor)
   - [Feature 9: Composite & Partial Indexes](#feature-9-composite--partial-indexes)
   - [Feature 10: Platform Dashboard Statistics](#feature-10-platform-dashboard-statistics)
6. [Database Optimization Strategy](#database-optimization-strategy)
7. [API Endpoints](#api-endpoints)
8. [Setup & Migration](#setup--migration)

---

## Overview

XorOJ is a competitive programming online judge platform. The database layer uses **PostgreSQL 14+** with **Hibernate/JPA** for ORM and includes advanced PostgreSQL features:

- **6 triggers** for audit logging, solve count maintenance, and materialized view refresh
- **2 cursor-based stored functions** for analytics and recommendations
- **1 materialized view** for precomputed user statistics
- **5 stored functions** for leaderboard, heatmap, platform stats, and more
- **12+ indexes** including partial, composite, covering, and GIN indexes
- **Window functions** (DENSE_RANK) for ranking
- **generate_series** for time-series data generation

**Database**: PostgreSQL 14+  
**ORM**: Hibernate 6 (Spring Boot 3)  
**DDL Strategy**: `hibernate.ddl-auto=update` + manual SQL migration for advanced objects

---

## Entity-Relationship Diagram

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│    users     │       │    submissions     │       │    problems      │
├──────────────┤       ├───────────────────┤       ├──────────────────┤
│ id (PK)      │◄──┐   │ id (PK)           │   ┌──►│ id (PK)          │
│ username (UQ)│   │   │ user_id (FK)      │───┘   │ title (UQ)       │
│ email (UQ)   │   │   │ problem_id (FK)   │───────│ description      │
│ password     │   │   │ contest_id (FK)   │──┐    │ difficulty_rating│
│ first_name   │   └───│ file_path         │  │    │ solve_count      │
│ last_name    │       │ language           │  │    │ time_limit       │
│ bio          │       │ submission_time    │  │    │ memory_limit     │
│ institute    │       │ status             │  │    │ status           │
│ country      │       │ execution_time     │  │    │ author_id (FK)   │
│ contact      │       │ memory_used        │  │    │ ...              │
│ role         │       │ error_message      │  │    └──────────────────┘
└──────────────┘       │ score              │  │            │
       │               └───────────────────┘  │            │
       │                                       │    ┌───────┴──────────┐
       │               ┌───────────────────┐  │    │  problems_tags   │
       │               │     contest       │  │    ├──────────────────┤
       │               ├───────────────────┤  │    │ problem_id (FK)  │
       │          ┌───►│ id (PK)           │◄─┘    │ tags             │
       │          │    │ title             │        └──────────────────┘
       │          │    │ description       │
       │          │    │ start_time        │        ┌──────────────────┐
       │          │    │ end_time          │        │   test_files     │
       │          │    │ author_id (FK)    │        ├──────────────────┤
       │          │    │ duration          │        │ problem_id (PK)  │
       │          │    │ status            │        │ test_id (PK)     │
       │          │    └───────────────────┘        │ file_name        │
       │          │            │                    │ file_path        │
       │          │    ┌───────┴──────────┐        └──────────────────┘
       │          │    │contest_problems  │
       │          │    ├──────────────────┤        ┌──────────────────┐
       │          │    │ contest_id (FK)  │        │ generator_files  │
       │          │    │ problems_id (FK) │        ├──────────────────┤
       │          │    └──────────────────┘        │ problem_id (PK)  │
       │          │                                │ generator_id (PK)│
       │          │    ┌──────────────────┐        │ file_name        │
       │          │    │contest_participants│      │ file_path        │
       │          │    ├──────────────────┤        └──────────────────┘
       └──────────┼───►│ contest_id (FK)  │
                  │    │ participants_id  │        ┌──────────────────┐
                  │    └──────────────────┘        │problem_contributors│
                  │                                ├──────────────────┤
                  │    ┌──────────────────┐        │ problem_id (PK)  │
                  │    │standings_snapshot │        │ user_id (PK)     │
                  │    ├──────────────────┤        │ role             │
                  └────│ contest_id (PK)  │        └──────────────────┘
                       │ version          │
                       │ payload_json     │        ┌──────────────────┐
                       │ finalized        │        │   audit_log      │
                       │ updated_at       │        ├──────────────────┤
                       └──────────────────┘        │ id (PK)          │
                                                   │ table_name       │
                       ┌──────────────────────┐    │ operation        │
                       │ mv_user_statistics   │    │ row_id           │
                       │ (MATERIALIZED VIEW)  │    │ old_data (JSONB) │
                       ├──────────────────────┤    │ new_data (JSONB) │
                       │ user_id              │    │ changed_by       │
                       │ username             │    │ changed_at       │
                       │ problems_solved      │    └──────────────────┘
                       │ accepted_count       │
                       │ total_submissions    │    ┌──────────────────┐
                       │ acceptance_rate      │    │mv_refresh_tracker│
                       │ contests_participated│    ├──────────────────┤
                       │ last_submission_at   │    │ view_name (PK)   │
                       └──────────────────────┘    │ last_refresh     │
                                                   └──────────────────┘
```

---

## Table Schemas

### `users`
| Column      | Type         | Constraints       | Description                    |
|-------------|-------------|-------------------|--------------------------------|
| id          | BIGSERIAL   | PK, AUTO          | Unique user identifier         |
| username    | VARCHAR     | NOT NULL, UNIQUE   | Login username                 |
| email       | VARCHAR     | NOT NULL, UNIQUE   | Email address                  |
| password    | VARCHAR     | NOT NULL, MIN(4)   | BCrypt-hashed password         |
| first_name  | VARCHAR     | NOT NULL           | First name                     |
| last_name   | VARCHAR     |                   | Last name                      |
| bio         | VARCHAR     |                   | User bio/description           |
| institute   | VARCHAR     |                   | Educational institution        |
| country     | VARCHAR     |                   | Country of residence           |
| contact     | VARCHAR     |                   | Contact information            |
| role        | VARCHAR     |                   | User role (e.g., "USER")       |

### `problems`
| Column            | Type     | Constraints       | Description                     |
|-------------------|---------|-------------------|---------------------------------|
| id                | BIGSERIAL| PK, AUTO          | Unique problem identifier       |
| title             | VARCHAR | NOT NULL, UNIQUE   | Problem title                   |
| description       | TEXT    |                   | Problem statement (Markdown)    |
| input_format      | TEXT    |                   | Input format description        |
| output_format     | TEXT    |                   | Output format description       |
| sample_input      | TEXT    |                   | Sample input                    |
| sample_output     | TEXT    |                   | Sample output                   |
| notes             | TEXT    |                   | Additional notes                |
| problem_num       | INTEGER |                   | Problem number in contest       |
| author_id         | BIGINT  | FK → users.id     | Creator of the problem          |
| difficulty_rating | INTEGER | 800-4000          | Difficulty rating               |
| solve_count       | INTEGER | DEFAULT 0         | Number of unique solvers (auto-updated by trigger) |
| time_limit        | INTEGER | DEFAULT 1000      | Time limit in milliseconds      |
| memory_limit      | INTEGER | DEFAULT 512       | Memory limit in KB              |
| status            | VARCHAR | DEFAULT 'public'  | Visibility status               |
| input_file_type   | VARCHAR |                   | Input file extension            |
| output_file_type  | VARCHAR |                   | Output file extension           |
| main_solution_path| VARCHAR |                   | Path to reference solution      |
| checker_path      | VARCHAR |                   | Path to custom checker          |
| validator_path    | VARCHAR |                   | Path to input validator         |

### `submissions`
| Column          | Type      | Constraints    | Description                      |
|-----------------|----------|----------------|----------------------------------|
| id              | BIGSERIAL| PK, AUTO        | Unique submission identifier     |
| user_id         | BIGINT   | FK → users.id   | Submitting user                  |
| problem_id      | BIGINT   | FK → problems.id| Target problem                   |
| contest_id      | BIGINT   | FK → contest.id | Associated contest (nullable)    |
| file_path       | VARCHAR  |                | Path to submitted code file      |
| language        | VARCHAR  |                | Programming language (e.g., "cpp")|
| submission_time | TIMESTAMP|                | Submission timestamp             |
| status          | VARCHAR  | ENUM           | Verdict: PENDING, RUNNING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, COMPILATION_ERROR, RUNTIME_ERROR |
| execution_time  | BIGINT   |                | Execution time in ms             |
| memory_used     | BIGINT   |                | Memory used in KB                |
| error_message   | VARCHAR  |                | Error details (for CE/RE)        |
| score           | INTEGER  |                | Score (for partial scoring)      |

### `contest`
| Column      | Type      | Constraints    | Description                |
|-------------|----------|----------------|----------------------------|
| id          | BIGSERIAL| PK, AUTO        | Contest identifier         |
| title       | VARCHAR  |                | Contest name               |
| description | VARCHAR(1000)|             | Contest description        |
| start_time  | TIMESTAMP|                | Scheduled start            |
| end_time    | TIMESTAMP|                | Scheduled end              |
| author_id   | BIGINT   | FK → users.id   | Contest organizer          |
| duration    | INTEGER  |                | Duration in minutes        |
| status      | VARCHAR  | ENUM           | UPCOMING, RUNNING, ENDED (calculated dynamically) |

### `contest_problems` (Join Table)
| Column      | Type   | Constraints        |
|-------------|--------|-------------------|
| contest_id  | BIGINT | FK → contest.id   |
| problems_id | BIGINT | FK → problems.id  |

### `contest_participants` (Join Table)
| Column          | Type   | Constraints      |
|-----------------|--------|-----------------|
| contest_id      | BIGINT | FK → contest.id |
| participants_id | BIGINT | FK → users.id   |

### `test_files` (Composite PK)
| Column     | Type    | Constraints           |
|------------|--------|----------------------|
| problem_id | BIGINT | PK, FK → problems.id |
| test_id    | INTEGER| PK                   |
| file_name  | VARCHAR|                      |
| file_path  | VARCHAR|                      |

### `generator_files` (Composite PK)
| Column       | Type    | Constraints           |
|--------------|--------|----------------------|
| problem_id   | BIGINT | PK, FK → problems.id |
| generator_id | INTEGER| PK                   |
| file_name    | VARCHAR|                      |
| file_path    | VARCHAR|                      |

### `problem_contributors` (Composite PK)
| Column     | Type    | Constraints           |
|------------|--------|----------------------|
| problem_id | BIGINT | PK, FK → problems.id |
| user_id    | BIGINT | PK, FK → users.id    |
| role       | VARCHAR|                      |

### `standings_snapshot`
| Column       | Type      | Constraints   |
|--------------|----------|--------------|
| contest_id   | BIGINT   | PK           |
| version      | BIGINT   |              |
| payload_json | TEXT     | JSON blob    |
| finalized    | BOOLEAN  |              |
| updated_at   | TIMESTAMP|              |

### `problems_tags` (Element Collection)
| Column     | Type    | Constraints           |
|------------|--------|----------------------|
| problem_id | BIGINT | FK → problems.id     |
| tags       | VARCHAR|                      |

### `audit_log` (Created by migration)
| Column     | Type      | Constraints    | Description              |
|------------|----------|----------------|--------------------------|
| id         | BIGSERIAL| PK, AUTO        | Audit entry identifier   |
| table_name | VARCHAR  | NOT NULL        | Source table name        |
| operation  | VARCHAR  | NOT NULL        | INSERT, UPDATE, DELETE   |
| row_id     | BIGINT   |                | PK of affected row       |
| old_data   | JSONB    |                | Previous row state       |
| new_data   | JSONB    |                | New row state            |
| changed_by | VARCHAR  |                | User who made the change |
| changed_at | TIMESTAMP| NOT NULL, NOW()| When the change occurred |

### `mv_refresh_tracker` (Helper table)
| Column       | Type      | Constraints | Description                    |
|-------------|----------|-------------|--------------------------------|
| view_name   | VARCHAR  | PK          | Name of the materialized view  |
| last_refresh| TIMESTAMP| NOT NULL    | Last refresh timestamp         |

---

## Relationships

| Relationship               | Type     | Description                                      |
|---------------------------|----------|--------------------------------------------------|
| users → submissions        | 1:N      | A user can make many submissions                 |
| problems → submissions     | 1:N      | A problem receives many submissions              |
| contest → submissions      | 1:N      | Contest submissions (nullable FK)                |
| users → problems           | 1:N      | Author relationship (via author_id)              |
| contest → problems         | M:N      | Via contest_problems join table                  |
| contest → users            | M:N      | Via contest_participants join table              |
| problems → test_files      | 1:N      | Composite PK (problem_id, test_id)               |
| problems → generator_files | 1:N      | Composite PK (problem_id, generator_id)          |
| problems → problem_contributors | 1:N | Composite PK (problem_id, user_id)              |
| problems → problems_tags   | 1:N      | Element collection for tagging                   |
| contest → standings_snapshot| 1:1     | ICPC-style standings JSON cache                  |

---

## Advanced Database Features

### Feature 1: Audit Trail Triggers

**Purpose**: Automatically capture every INSERT, UPDATE, and DELETE on critical tables for compliance, debugging, and analytics.

**Database Objects**:
- **Table**: `audit_log` — stores all change records with JSONB old/new data
- **Function**: `fn_audit_trigger()` — generic trigger function
- **Triggers**:
  - `trg_audit_submissions` on `submissions`
  - `trg_audit_users` on `users`
  - `trg_audit_problems` on `problems`
  - `trg_audit_contest` on `contest`

**How it works**:
```sql
-- The trigger function captures the operation type and serializes the row as JSONB
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
END;
$$ LANGUAGE plpgsql;
```

**Integration**:
- Backend: `AuditLogRepository` + `AdvancedDBService.getAuditLogs()`
- Frontend: `/audit-log` page with filterable, paginated table and expandable JSON diff view
- API: `GET /api/db/audit?page=0&size=20&table=submissions&operation=UPDATE`

---

### Feature 2: User Statistics Materialized View

**Purpose**: Precompute per-user statistics for fast profile display and leaderboard queries, avoiding expensive joins at query time.

**Database Objects**:
- **Materialized View**: `mv_user_statistics`
- **Function**: `fn_refresh_user_statistics()` — refreshes the view
- **Trigger**: `trg_refresh_user_stats` — auto-refreshes (debounced to 30s intervals)
- **Helper table**: `mv_refresh_tracker` — tracks last refresh to prevent excessive refreshes

**Computed Columns**:
| Column                | Computation                                                  |
|-----------------------|--------------------------------------------------------------|
| total_submissions     | COUNT(s.id)                                                  |
| accepted_count        | COUNT(s.id) WHERE status = 'ACCEPTED'                        |
| problems_solved       | COUNT(DISTINCT problem_id) WHERE status = 'ACCEPTED'         |
| acceptance_rate       | 100 * accepted_count / total_submissions                     |
| contests_participated | COUNT(DISTINCT contest_id) WHERE contest_id IS NOT NULL      |
| last_submission_at    | MAX(submission_time)                                         |

**Debounced Auto-Refresh**:
```sql
-- Only refreshes if last refresh was >30 seconds ago
IF (NOW() - v_last) > INTERVAL '30 seconds' THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_statistics;
END IF;
```

**Integration**:
- Backend: `AdvancedDBRepository.getUserStatistics()` / `getUserStatisticsByUsername()`
- Frontend: Stats cards on ProfilePage and UserAnalyticsPage
- API: `GET /api/db/stats/user/{username}`, `GET /api/db/stats/me`

---

### Feature 3: Auto-update solve_count via Trigger

**Purpose**: Maintain accurate `problems.solve_count` automatically without application-level code. Counts **distinct users** who have at least one ACCEPTED submission.

**Database Objects**:
- **Function**: `fn_update_solve_count()`
- **Trigger**: `trg_update_solve_count` on `submissions` (AFTER INSERT, UPDATE OF status, DELETE)

**How it works**:
```sql
-- Recounts distinct solvers whenever submission status involves ACCEPTED
SELECT COUNT(DISTINCT user_id) INTO v_new_count
FROM submissions
WHERE problem_id = v_problem_id AND status = 'ACCEPTED';

UPDATE problems SET solve_count = v_new_count WHERE id = v_problem_id;
```

**Key Design Decisions**:
- Uses `COUNT(DISTINCT user_id)` — a user solving the same problem twice counts once
- Only triggers when status involves ACCEPTED (skips irrelevant updates)
- Handles INSERT, UPDATE, and DELETE operations

**Integration**: Transparent — the `solve_count` column is automatically maintained. No application code changes needed. The ProblemSet page displays accurate counts.

---

### Feature 4: Global Leaderboard with Window Functions

**Purpose**: Rank users globally using PostgreSQL's `DENSE_RANK()` window function for fair, gap-free rankings.

**Database Objects**:
- **Function**: `fn_global_leaderboard(p_limit, p_offset)` — paginated ranked results

**Ranking Criteria** (ordered):
1. Problems solved (DESC)
2. Acceptance rate (DESC)
3. Total submissions (ASC — fewer is better)

```sql
DENSE_RANK() OVER (
    ORDER BY mv.problems_solved DESC, mv.acceptance_rate DESC, mv.total_submissions ASC
)
```

**Why DENSE_RANK()?** If two users tie, they get the same rank, and the next rank is not skipped. E.g., ranks: 1, 1, 2, 3 (not 1, 1, 3, 4).

**Integration**:
- Backend: `AdvancedDBRepository.getLeaderboard()`
- Frontend: `/leaderboard` page with gold/silver/bronze styling for top 3
- API: `GET /api/db/leaderboard?page=0&size=50`

---

### Feature 5: Submission Analytics with Cursor

**Purpose**: Compute per-user verdict distribution using a PL/pgSQL **cursor** to iterate through grouped results.

**Database Objects**:
- **Function**: `fn_user_submission_analytics(p_user_id)` — cursor-based analytics

**Cursor Usage**:
```sql
DECLARE
    cur_verdicts CURSOR FOR
        SELECT s.status, COUNT(*), AVG(s.execution_time), AVG(s.memory_used)
        FROM submissions s WHERE s.user_id = p_user_id
        GROUP BY s.status ORDER BY COUNT(*) DESC;
BEGIN
    OPEN cur_verdicts;
    LOOP
        FETCH cur_verdicts INTO rec;
        EXIT WHEN NOT FOUND;
        -- Process each verdict group
        percentage := ROUND(100.0 * rec.cnt / total_count, 2);
        RETURN NEXT;
    END LOOP;
    CLOSE cur_verdicts;
END;
```

**Returns per verdict**: count, percentage, average execution time, average memory used.

**Integration**:
- Backend: `AdvancedDBRepository.getSubmissionAnalytics()`
- Frontend: Horizontal bar chart on UserAnalyticsPage showing verdict distribution
- API: `GET /api/db/analytics/{username}`

---

### Feature 6: Daily Activity Heatmap

**Purpose**: Generate a GitHub-style contribution heatmap showing daily submission activity over the past year.

**Database Objects**:
- **Function**: `fn_user_activity_heatmap(p_user_id, p_start_date, p_end_date)`

**Key Technique — generate_series**:
```sql
FROM generate_series(p_start_date::TIMESTAMP, p_end_date::TIMESTAMP, '1 day') AS d(dt)
LEFT JOIN submissions s ON s.user_id = p_user_id AND s.submission_time::DATE = d.dt::DATE
```

This ensures every day in the range appears in the output, even days with zero submissions.

**Intensity Levels** (0–4):
| Level | Condition           | Visual |
|-------|---------------------|--------|
| 0     | 0 submissions       | Dark   |
| 1     | ≤ 25% of max daily  | Light  |
| 2     | ≤ 50% of max daily  | Medium |
| 3     | ≤ 75% of max daily  | Bright |
| 4     | > 75% of max daily  | Max    |

**Integration**:
- Backend: `AdvancedDBRepository.getActivityHeatmap()`
- Frontend: Grid-based heatmap on UserAnalyticsPage with tooltips
- API: `GET /api/db/heatmap/{username}`

---

### Feature 7: Tag-based Problem Recommendations

**Purpose**: Analyze which problem tags a user has solved and recommend unsolved problems with similar tags. Uses **CTEs** (Common Table Expressions) and a **cursor**.

**Database Objects**:
- **Function**: `fn_recommend_problems(p_user_id, p_limit)` — cursor-based recommendation engine

**Algorithm** (4 CTEs + cursor):
1. **solved_problems**: DISTINCT problems with ACCEPTED verdict
2. **user_tags**: Tags from solved problems
3. **candidate_problems**: Unsolved public problems
4. **scored**: Relevance scoring

**Scoring Formula**:
```sql
relevance_score = (matching_tags * 10) +
    CASE difficulty
        WHEN 800-1600 THEN 5    -- Beginner-friendly boost
        WHEN 1600-2400 THEN 3   -- Intermediate boost
        ELSE 1
    END +
    LEAST(solve_count, 100) / 20  -- Popularity bonus (capped)
```

**Integration**:
- Backend: `AdvancedDBRepository.getRecommendations()`
- Frontend: `/recommendations` page with relevance scores
- API: `GET /api/db/recommendations?limit=10`

---

### Feature 8: Contest Performance Summary with Cursor

**Purpose**: Compute per-contest performance statistics for a user using a PL/pgSQL **cursor** to iterate over participated contests.

**Database Objects**:
- **Function**: `fn_user_contest_performance(p_user_id)` — cursor-based contest stats

**Cursor iterates** over contests from `contest_participants` and computes:
- Total problems in contest
- Problems attempted (DISTINCT problem_id)
- Problems solved (ACCEPTED)
- Total submissions in that contest
- Solve percentage

```sql
DECLARE
    cur_contests CURSOR FOR
        SELECT DISTINCT c.id, c.title
        FROM contest c
        JOIN contest_participants cp ON cp.contest_id = c.id
        WHERE cp.participants_id = p_user_id;
```

**Integration**:
- Backend: `AdvancedDBRepository.getContestPerformance()`
- Frontend: Contest performance table on UserAnalyticsPage
- API: `GET /api/db/contest-performance/{username}`

---

### Feature 9: Composite & Partial Indexes

**Purpose**: Optimize query performance for the most frequent access patterns.

| Index Name                          | Type      | Table         | Columns/Condition                                      | Purpose                           |
|-------------------------------------|-----------|---------------|--------------------------------------------------------|-----------------------------------|
| `idx_submissions_user_status`       | Composite | submissions   | (user_id, status)                                       | Fast user verdict lookups         |
| `idx_submissions_contest_time`      | Composite | submissions   | (contest_id, submission_time DESC)                      | Contest submission feed            |
| `idx_submissions_accepted`          | Partial   | submissions   | (problem_id, user_id) WHERE status='ACCEPTED'           | Solve count queries (most common) |
| `idx_submissions_contest_page`      | Covering  | submissions   | (contest_id, time DESC) INCLUDE (user_id, problem_id, ...)| Paginated contest submissions   |
| `idx_problems_public_diff`          | Partial   | problems      | (difficulty_rating, solve_count DESC) WHERE status='public'| Problem set filtering          |
| `idx_problems_tags_btree`           | Composite | problems_tags | (tags, problem_id)                                      | Tag search optimization           |
| `idx_contest_participants`          | Composite | contest_participants | (participants_id, contest_id)                     | Registration check                |
| `idx_audit_log_table`              | B-Tree    | audit_log     | (table_name)                                            | Filtered audit queries            |
| `idx_audit_log_operation`          | B-Tree    | audit_log     | (operation)                                             | Filtered audit queries            |
| `idx_audit_log_changed_at`        | B-Tree    | audit_log     | (changed_at DESC)                                       | Recent audit entries              |
| `idx_audit_composite`              | Composite | audit_log     | (table_name, changed_at DESC)                            | Combined filter + sort            |
| `idx_mv_user_stats_uid`           | Unique    | mv_user_statistics | (user_id)                                          | Fast MV lookups + CONCURRENT refresh |
| `idx_mv_user_stats_solved`        | B-Tree    | mv_user_statistics | (problems_solved DESC)                             | Leaderboard ordering              |

**Partial Index Benefit**: `idx_submissions_accepted` only indexes rows where `status='ACCEPTED'`. Since ACCEPTED submissions are typically ~20-30% of all submissions, this index is ~70% smaller than a full index, dramatically faster for solve_count recalculation.

**Covering Index Benefit**: `idx_submissions_contest_page` includes all columns needed for pagination queries via `INCLUDE`, allowing index-only scans without table heap access.

---

### Feature 10: Platform Dashboard Statistics

**Purpose**: Provide a real-time system overview using a stored function that aggregates data across all tables.

**Database Objects**:
- **Function**: `fn_platform_stats()` — computes 12 system-wide metrics

**Metrics Computed**:
| Metric                    | Query                                                    |
|---------------------------|----------------------------------------------------------|
| total_users               | COUNT(*) FROM users                                      |
| total_problems            | COUNT(*) FROM problems WHERE status='public'             |
| total_submissions         | COUNT(*) FROM submissions                                |
| total_contests            | COUNT(*) FROM contest                                    |
| submissions_today         | COUNT(*) WHERE submission_time::DATE = CURRENT_DATE      |
| submissions_this_week     | COUNT(*) WHERE submission_time >= CURRENT_DATE - 7 days  |
| active_contests           | COUNT(*) WHERE start_time <= NOW() AND end_time >= NOW() |
| avg_acceptance_rate       | AVG(acceptance_rate) FROM mv_user_statistics             |
| most_solved_problem       | TOP 1 by solve_count                                     |
| most_active_user          | TOP 1 by submission count                                |

**Integration**:
- Backend: `AdvancedDBRepository.getPlatformStats()`
- Frontend: `/dashboard` page with stat cards and highlights
- API: `GET /api/db/platform-stats`

---

## Database Optimization Strategy

### Query Optimization Techniques Used

1. **Materialized Views**: `mv_user_statistics` precomputes expensive aggregations, turning O(N) joins into O(1) lookups
2. **Debounced Refresh**: The materialized view only refreshes every 30+ seconds, preventing refresh storms
3. **CONCURRENT Refresh**: Uses `REFRESH MATERIALIZED VIEW CONCURRENTLY` so the view remains readable during refresh
4. **Partial Indexes**: Only index the subset of data that's frequently queried (e.g., ACCEPTED submissions)
5. **Covering Indexes**: Include all needed columns to enable index-only scans
6. **JSONB for Audit**: Flexible schema for audit data without additional tables per audited entity
7. **Stored Functions**: Push computation to the database layer, reducing network round-trips
8. **Cursors**: Used in stored functions for memory-efficient row-by-row processing of large result sets
9. **generate_series**: Creates date ranges server-side, avoiding application-level date generation

### Connection & Configuration

```yaml
spring:
  datasource:
    url: ${POSTGRES_URL}       # e.g., jdbc:postgresql://localhost:5432/xoroj
    username: ${POSTGRES_USERNAME}
    password: ${POSTGRES_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update         # Hibernate manages entity tables
    show-sql: false
```

---

## API Endpoints

| Method | Path                                    | Feature | Description                        |
|--------|----------------------------------------|---------|-------------------------------------|
| GET    | /api/db/audit                          | 1       | Paginated audit log with filters    |
| GET    | /api/db/audit/history                  | 1       | Change history for specific entity  |
| GET    | /api/db/stats/user/{username}          | 2       | User statistics from mat. view      |
| GET    | /api/db/stats/me                       | 2       | Current user's statistics           |
| GET    | /api/db/leaderboard                    | 4       | Global rankings (window functions)  |
| GET    | /api/db/analytics/{username}           | 5       | Verdict distribution (cursor fn)    |
| GET    | /api/db/heatmap/{username}             | 6       | Activity heatmap (generate_series)  |
| GET    | /api/db/recommendations                | 7       | Problem recommendations (cursor fn) |
| GET    | /api/db/contest-performance/{username} | 8       | Contest stats (cursor fn)           |
| GET    | /api/db/platform-stats                 | 10      | System-wide dashboard stats         |
| POST   | /api/db/refresh-stats                  | 2       | Manually refresh materialized view  |

---

## Setup & Migration

### Prerequisites
- PostgreSQL 14+ installed and running
- Database created (e.g., `xoroj`)
- Environment variables set:
  - `POSTGRES_URL` = `jdbc:postgresql://localhost:5432/xoroj`
  - `POSTGRES_USERNAME` = your DB username
  - `POSTGRES_PASSWORD` = your DB password

### Running the Migration

1. **Start the backend first** to let Hibernate create/update entity tables:
   ```bash
   cd backend
   mvnw.cmd spring-boot:run
   ```

2. **Run the SQL migration** against your database:
   ```bash
   psql -U your_username -d xoroj -f src/main/resources/db/migration/V1__advanced_features.sql
   ```

   Or via any SQL client (pgAdmin, DBeaver, etc.), execute the contents of `V1__advanced_features.sql`.

3. **Verify** by checking the `audit_log` table and materialized view:
   ```sql
   SELECT * FROM mv_user_statistics;
   SELECT * FROM audit_log ORDER BY changed_at DESC LIMIT 5;
   SELECT * FROM fn_platform_stats();
   ```

### Verification Queries

```sql
-- Test audit triggers
INSERT INTO users (username, email, password, first_name)
VALUES ('test_audit', 'test@test.com', 'pass', 'Test');
SELECT * FROM audit_log WHERE table_name = 'users' ORDER BY changed_at DESC LIMIT 1;

-- Test leaderboard
SELECT * FROM fn_global_leaderboard(10, 0);

-- Test heatmap
SELECT * FROM fn_user_activity_heatmap(1) LIMIT 7;

-- Test recommendations
SELECT * FROM fn_recommend_problems(1, 5);

-- Test platform stats
SELECT * FROM fn_platform_stats();
```

---

## Summary of Advanced Database Techniques

| Technique             | Features Using It | PostgreSQL Feature     |
|-----------------------|-------------------|------------------------|
| Triggers              | 1, 2, 3          | AFTER INSERT/UPDATE/DELETE triggers |
| Cursors               | 5, 7, 8          | DECLARE CURSOR / FETCH / CLOSE     |
| Materialized Views    | 2, 4             | CREATE MATERIALIZED VIEW            |
| Window Functions      | 4                | DENSE_RANK() OVER (...)             |
| Stored Functions      | 4, 5, 6, 7, 8, 10| CREATE FUNCTION ... RETURNS TABLE   |
| CTEs                  | 7                | WITH ... AS (...)                   |
| generate_series       | 6                | generate_series(start, end, step)   |
| JSONB                 | 1                | to_jsonb(), JSONB column type       |
| Partial Indexes       | 9                | CREATE INDEX ... WHERE condition    |
| Covering Indexes      | 9                | CREATE INDEX ... INCLUDE (cols)     |
| Composite Indexes     | 9                | Multi-column B-Tree indexes         |
| CONCURRENT Refresh    | 2                | REFRESH MATERIALIZED VIEW CONCURRENTLY |
