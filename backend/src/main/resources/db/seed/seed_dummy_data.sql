-- ============================================================================
-- XorOJ Seed Script — Dummy Data for Testing All 10 Advanced DB Features
-- Run AFTER V1__advanced_features.sql migration has been applied.
-- ============================================================================

-- ============================================================================
-- 1. USERS (passwords are BCrypt-hashed "password123")
-- ============================================================================
INSERT INTO users (username, email, password, first_name, last_name, bio, institute, country, contact, role)
VALUES
  ('alice',   'alice@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alice',   'Smith',    'Competitive programmer',      'MIT',        'USA',    'alice@contact.com',    'AUTHOR'),
  ('bob',     'bob@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bob',     'Johnson',  'Algorithm enthusiast',        'Stanford',   'USA',    'bob@contact.com',      'USER'),
  ('charlie', 'charlie@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Charlie', 'Williams', 'Graph theory lover',          'Oxford',     'UK',     'charlie@contact.com',  'USER'),
  ('diana',   'diana@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Diana',   'Brown',    'Data structures expert',      'ETH Zurich', 'Switzerland', NULL,              'USER'),
  ('eve',     'eve@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Eve',     'Davis',    'DP specialist',               'IIT Delhi',  'India',  'eve@contact.com',      'AUTHOR'),
  ('frank',   'frank@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Frank',   'Miller',   'Geometry & math problems',    'Tsinghua',   'China',  NULL,                   'USER'),
  ('grace',   'grace@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Grace',   'Wilson',   'Beginner friendly coder',     'UBC',        'Canada', 'grace@contact.com',    'USER'),
  ('hank',    'hank@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hank',    'Moore',    'Contest organizer',           'NUS',        'Singapore', NULL,               'AUTHOR'),
  ('ivy',     'ivy@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ivy',     'Taylor',   'Number theory fan',           'KAIST',      'South Korea', 'ivy@contact.com', 'USER'),
  ('jack',    'jack@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jack',    'Anderson', 'Strings and automata expert', 'CMU',        'USA',    'jack@contact.com',     'USER')
ON CONFLICT (username) DO NOTHING;


-- ============================================================================
-- 2. PROBLEMS (authored by the first registered user — typically the admin/main user)
-- ============================================================================
-- Note: We use a DO block to get the actual user IDs and problem IDs dynamically

DO $$
DECLARE
    v_main_author BIGINT;
    v_p1 BIGINT; v_p2 BIGINT; v_p3 BIGINT; v_p4 BIGINT; v_p5 BIGINT;
    v_p6 BIGINT; v_p7 BIGINT; v_p8 BIGINT; v_p9 BIGINT; v_p10 BIGINT;
BEGIN
    -- Use the FIRST registered user as the author so they appear in the
    -- logged-in user's "My Problems" dropdown when adding to contests.
    SELECT id INTO v_main_author FROM users ORDER BY id LIMIT 1;

    -- Insert 10 problems (with problem_num for global ordering)
    -- NOTE: memory_limit is stored in KB (256 MB = 262144 KB, 512 MB = 524288 KB)
    INSERT INTO problems (title, description, input_format, output_format, sample_input, sample_output, difficulty_rating, solve_count, time_limit, memory_limit, status, author_id, problem_num)
    VALUES
      ('Two Sum',           'Given an array of integers and a target, find two numbers that add up to the target.', 'First line: n and target. Second line: n integers.', 'Two indices (1-indexed).', '4 9\n2 7 11 15', '1 2', 800, 0, 1000, 262144, 'public', v_main_author, 1),
      ('Binary Search',     'Implement binary search on a sorted array.', 'First line: n and target. Second line: n sorted integers.', 'Index of target or -1.', '5 3\n1 2 3 4 5', '3', 900, 0, 1000, 262144, 'public', v_main_author, 2),
      ('DFS Traversal',     'Perform depth-first search on a graph and output visited nodes.', 'First line: n m (nodes, edges). Next m lines: u v.', 'Space-separated visited nodes from node 1.', '4 3\n1 2\n1 3\n3 4', '1 2 3 4', 1200, 0, 2000, 524288, 'public', v_main_author, 3),
      ('Knapsack Problem',  'Classic 0/1 knapsack. Maximize value within weight limit.', 'First line: n W. Next n lines: weight value.', 'Maximum value.', '3 50\n10 60\n20 100\n30 120', '220', 1500, 0, 2000, 524288, 'public', v_main_author, 4),
      ('Shortest Path',     'Find the shortest path in a weighted graph using Dijkstra.', 'First line: n m. Next m lines: u v w. Last line: source dest.', 'Shortest distance.', '4 5\n1 2 1\n1 3 4\n2 3 2\n2 4 6\n3 4 3\n1 4', '6', 1800, 0, 3000, 524288, 'public', v_main_author, 5),
      ('String Matching',   'Count occurrences of a pattern in text using KMP algorithm.', 'First line: text. Second line: pattern.', 'Number of occurrences.', 'ababababab\nabab', '4', 1600, 0, 1000, 262144, 'public', v_main_author, 6),
      ('Segment Tree',      'Range sum query with point updates.', 'First line: n q. Second line: n integers. Next q lines: type l r or type i v.', 'Answer for each query.', '5 3\n1 2 3 4 5\n1 2 4\n2 3 10\n1 2 4', '9\n17', 2200, 0, 2000, 524288, 'public', v_main_author, 7),
      ('Matrix Exponent',   'Compute the n-th Fibonacci number using matrix exponentiation.', 'Single integer n.', 'n-th Fibonacci number mod 1e9+7.', '10', '55', 2500, 0, 1000, 262144, 'public', v_main_author, 8),
      ('Convex Hull',       'Find the convex hull of a set of 2D points.', 'First line: n. Next n lines: x y coordinates.', 'Number of points on convex hull.', '5\n0 0\n1 1\n2 2\n0 2\n2 0', '4', 2800, 0, 2000, 524288, 'public', v_main_author, 9),
      ('Network Flow',      'Find maximum flow in a flow network.', 'First line: n m. Next m lines: u v capacity. Source=1, sink=n.', 'Maximum flow value.', '4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 3\n3 4 2', '5', 3200, 0, 3000, 1048576, 'public', v_main_author, 10)
    ON CONFLICT (title) DO NOTHING;

    -- Get problem IDs
    SELECT id INTO v_p1  FROM problems WHERE title = 'Two Sum';
    SELECT id INTO v_p2  FROM problems WHERE title = 'Binary Search';
    SELECT id INTO v_p3  FROM problems WHERE title = 'DFS Traversal';
    SELECT id INTO v_p4  FROM problems WHERE title = 'Knapsack Problem';
    SELECT id INTO v_p5  FROM problems WHERE title = 'Shortest Path';
    SELECT id INTO v_p6  FROM problems WHERE title = 'String Matching';
    SELECT id INTO v_p7  FROM problems WHERE title = 'Segment Tree';
    SELECT id INTO v_p8  FROM problems WHERE title = 'Matrix Exponent';
    SELECT id INTO v_p9  FROM problems WHERE title = 'Convex Hull';
    SELECT id INTO v_p10 FROM problems WHERE title = 'Network Flow';

    -- ============================================================================
    -- 3. PROBLEM TAGS (element collection table)
    -- ============================================================================
    INSERT INTO problem_tags (problem_id, tags) VALUES
      (v_p1, 'arrays'), (v_p1, 'hash-table'), (v_p1, 'easy'),
      (v_p2, 'binary-search'), (v_p2, 'arrays'), (v_p2, 'easy'),
      (v_p3, 'graphs'), (v_p3, 'dfs'), (v_p3, 'medium'),
      (v_p4, 'dp'), (v_p4, 'greedy'), (v_p4, 'medium'),
      (v_p5, 'graphs'), (v_p5, 'shortest-path'), (v_p5, 'dijkstra'), (v_p5, 'hard'),
      (v_p6, 'strings'), (v_p6, 'kmp'), (v_p6, 'medium'),
      (v_p7, 'data-structures'), (v_p7, 'segment-tree'), (v_p7, 'hard'),
      (v_p8, 'math'), (v_p8, 'matrix'), (v_p8, 'dp'), (v_p8, 'hard'),
      (v_p9, 'geometry'), (v_p9, 'convex-hull'), (v_p9, 'hard'),
      (v_p10, 'graphs'), (v_p10, 'network-flow'), (v_p10, 'expert')
    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- 4. CONTESTS (all authored by the main user)
    -- ============================================================================
    -- Contest 1: Past contest (ENDED)
    INSERT INTO contest (title, description, start_time, end_time, author_id, duration, status)
    VALUES (
      'XorOJ Round #1',
      'First competitive programming round featuring easy-medium problems.',
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '30 days' + INTERVAL '2 hours',
      v_main_author, 120, 'ENDED'
    ) ON CONFLICT DO NOTHING;

    -- Contest 2: Past contest (ENDED)
    INSERT INTO contest (title, description, start_time, end_time, author_id, duration, status)
    VALUES (
      'XorOJ Round #2',
      'Second round with harder graph and DP problems.',
      NOW() - INTERVAL '15 days',
      NOW() - INTERVAL '15 days' + INTERVAL '3 hours',
      v_main_author, 180, 'ENDED'
    ) ON CONFLICT DO NOTHING;

    -- Contest 3: Currently running (RUNNING)
    INSERT INTO contest (title, description, start_time, end_time, author_id, duration, status)
    VALUES (
      'XorOJ Weekly Challenge',
      'Weekly challenge covering various topics.',
      NOW() - INTERVAL '1 hour',
      NOW() + INTERVAL '4 hours',
      v_main_author, 300, 'RUNNING'
    ) ON CONFLICT DO NOTHING;

    -- Contest 4: Upcoming
    INSERT INTO contest (title, description, start_time, end_time, author_id, duration, status)
    VALUES (
      'XorOJ Grand Finals',
      'Advanced problems in geometry, flows, and segment trees.',
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '7 days' + INTERVAL '5 hours',
      v_main_author, 300, 'UPCOMING'
    ) ON CONFLICT DO NOTHING;

END $$;


-- ============================================================================
-- 5. CONTEST PROBLEMS (link problems to contests)
-- ============================================================================
DO $$
DECLARE
    v_c1 BIGINT; v_c2 BIGINT; v_c3 BIGINT; v_c4 BIGINT;
    v_p1 BIGINT; v_p2 BIGINT; v_p3 BIGINT; v_p4 BIGINT; v_p5 BIGINT;
    v_p6 BIGINT; v_p7 BIGINT; v_p8 BIGINT; v_p9 BIGINT; v_p10 BIGINT;
BEGIN
    SELECT id INTO v_c1 FROM contest WHERE title = 'XorOJ Round #1';
    SELECT id INTO v_c2 FROM contest WHERE title = 'XorOJ Round #2';
    SELECT id INTO v_c3 FROM contest WHERE title = 'XorOJ Weekly Challenge';
    SELECT id INTO v_c4 FROM contest WHERE title = 'XorOJ Grand Finals';

    SELECT id INTO v_p1  FROM problems WHERE title = 'Two Sum';
    SELECT id INTO v_p2  FROM problems WHERE title = 'Binary Search';
    SELECT id INTO v_p3  FROM problems WHERE title = 'DFS Traversal';
    SELECT id INTO v_p4  FROM problems WHERE title = 'Knapsack Problem';
    SELECT id INTO v_p5  FROM problems WHERE title = 'Shortest Path';
    SELECT id INTO v_p6  FROM problems WHERE title = 'String Matching';
    SELECT id INTO v_p7  FROM problems WHERE title = 'Segment Tree';
    SELECT id INTO v_p8  FROM problems WHERE title = 'Matrix Exponent';
    SELECT id INTO v_p9  FROM problems WHERE title = 'Convex Hull';
    SELECT id INTO v_p10 FROM problems WHERE title = 'Network Flow';

    -- Round #1: easy problems
    INSERT INTO contest_problems (contest_id, problem_id) VALUES
      (v_c1, v_p1), (v_c1, v_p2), (v_c1, v_p3)
    ON CONFLICT DO NOTHING;

    -- Round #2: medium-hard problems
    INSERT INTO contest_problems (contest_id, problem_id) VALUES
      (v_c2, v_p4), (v_c2, v_p5), (v_c2, v_p6)
    ON CONFLICT DO NOTHING;

    -- Weekly Challenge: mixed
    INSERT INTO contest_problems (contest_id, problem_id) VALUES
      (v_c3, v_p3), (v_c3, v_p6), (v_c3, v_p7), (v_c3, v_p8)
    ON CONFLICT DO NOTHING;

    -- Grand Finals: hard/expert
    INSERT INTO contest_problems (contest_id, problem_id) VALUES
      (v_c4, v_p7), (v_c4, v_p8), (v_c4, v_p9), (v_c4, v_p10)
    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- 6. CONTEST PARTICIPANTS
    -- ============================================================================
    -- Get user IDs
    DECLARE
        v_alice BIGINT; v_bob BIGINT; v_charlie BIGINT; v_diana BIGINT;
        v_eve BIGINT; v_frank BIGINT; v_grace BIGINT; v_hank BIGINT;
        v_ivy BIGINT; v_jack BIGINT;
    BEGIN
        SELECT id INTO v_alice   FROM users WHERE username = 'alice';
        SELECT id INTO v_bob     FROM users WHERE username = 'bob';
        SELECT id INTO v_charlie FROM users WHERE username = 'charlie';
        SELECT id INTO v_diana   FROM users WHERE username = 'diana';
        SELECT id INTO v_eve     FROM users WHERE username = 'eve';
        SELECT id INTO v_frank   FROM users WHERE username = 'frank';
        SELECT id INTO v_grace   FROM users WHERE username = 'grace';
        SELECT id INTO v_hank    FROM users WHERE username = 'hank';
        SELECT id INTO v_ivy     FROM users WHERE username = 'ivy';
        SELECT id INTO v_jack    FROM users WHERE username = 'jack';

        -- Round #1 participants (most users + main author)
        INSERT INTO contest_participants (contest_id, user_id) VALUES
          (v_c1, v_bob), (v_c1, v_charlie), (v_c1, v_diana),
          (v_c1, v_frank), (v_c1, v_grace), (v_c1, v_ivy), (v_c1, v_jack)
        ON CONFLICT DO NOTHING;

        -- Round #2 participants
        INSERT INTO contest_participants (contest_id, user_id) VALUES
          (v_c2, v_bob), (v_c2, v_charlie), (v_c2, v_diana),
          (v_c2, v_eve), (v_c2, v_frank), (v_c2, v_jack)
        ON CONFLICT DO NOTHING;

        -- Weekly Challenge participants (ongoing) — include main author
        INSERT INTO contest_participants (contest_id, user_id) VALUES
          (v_c3, v_bob), (v_c3, v_charlie), (v_c3, v_diana),
          (v_c3, v_frank), (v_c3, v_grace), (v_c3, v_ivy)
        ON CONFLICT DO NOTHING;

        -- Grand Finals registrations
        INSERT INTO contest_participants (contest_id, user_id) VALUES
          (v_c4, v_bob), (v_c4, v_charlie), (v_c4, v_diana),
          (v_c4, v_frank), (v_c4, v_ivy), (v_c4, v_jack)
        ON CONFLICT DO NOTHING;

        -- Also add the main author as participant in all contests
        INSERT INTO contest_participants (contest_id, user_id) VALUES
          (v_c1, (SELECT id FROM users ORDER BY id LIMIT 1)),
          (v_c2, (SELECT id FROM users ORDER BY id LIMIT 1)),
          (v_c3, (SELECT id FROM users ORDER BY id LIMIT 1)),
          (v_c4, (SELECT id FROM users ORDER BY id LIMIT 1))
        ON CONFLICT DO NOTHING;
    END;
END $$;


-- ============================================================================
-- 7. SUBMISSIONS (spread across time, varied verdicts, contest & non-contest)
-- Triggers will auto-populate audit_log and update solve_count
-- ============================================================================
DO $$
DECLARE
    v_bob BIGINT; v_charlie BIGINT; v_diana BIGINT;
    v_frank BIGINT; v_grace BIGINT; v_ivy BIGINT; v_jack BIGINT; v_eve BIGINT;
    v_p1 BIGINT; v_p2 BIGINT; v_p3 BIGINT; v_p4 BIGINT; v_p5 BIGINT;
    v_p6 BIGINT; v_p7 BIGINT; v_p8 BIGINT; v_p9 BIGINT; v_p10 BIGINT;
    v_c1 BIGINT; v_c2 BIGINT; v_c3 BIGINT;
BEGIN
    SELECT id INTO v_bob     FROM users WHERE username = 'bob';
    SELECT id INTO v_charlie FROM users WHERE username = 'charlie';
    SELECT id INTO v_diana   FROM users WHERE username = 'diana';
    SELECT id INTO v_frank   FROM users WHERE username = 'frank';
    SELECT id INTO v_grace   FROM users WHERE username = 'grace';
    SELECT id INTO v_ivy     FROM users WHERE username = 'ivy';
    SELECT id INTO v_jack    FROM users WHERE username = 'jack';
    SELECT id INTO v_eve     FROM users WHERE username = 'eve';

    SELECT id INTO v_p1  FROM problems WHERE title = 'Two Sum';
    SELECT id INTO v_p2  FROM problems WHERE title = 'Binary Search';
    SELECT id INTO v_p3  FROM problems WHERE title = 'DFS Traversal';
    SELECT id INTO v_p4  FROM problems WHERE title = 'Knapsack Problem';
    SELECT id INTO v_p5  FROM problems WHERE title = 'Shortest Path';
    SELECT id INTO v_p6  FROM problems WHERE title = 'String Matching';
    SELECT id INTO v_p7  FROM problems WHERE title = 'Segment Tree';
    SELECT id INTO v_p8  FROM problems WHERE title = 'Matrix Exponent';
    SELECT id INTO v_p9  FROM problems WHERE title = 'Convex Hull';
    SELECT id INTO v_p10 FROM problems WHERE title = 'Network Flow';

    SELECT id INTO v_c1 FROM contest WHERE title = 'XorOJ Round #1';
    SELECT id INTO v_c2 FROM contest WHERE title = 'XorOJ Round #2';
    SELECT id INTO v_c3 FROM contest WHERE title = 'XorOJ Weekly Challenge';

    -- ═══════════════════════════════════════════════════════════════════════
    -- BOB: Active user — 15 submissions, spread over 60 days
    -- ═══════════════════════════════════════════════════════════════════════
    -- Non-contest submissions
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_bob, v_p1, NULL, 'cpp', NOW() - INTERVAL '55 days', 'WRONG_ANSWER',    150, 12000, 0),
      (v_bob, v_p1, NULL, 'cpp', NOW() - INTERVAL '54 days', 'ACCEPTED',         85, 10200, 100),
      (v_bob, v_p2, NULL, 'cpp', NOW() - INTERVAL '50 days', 'ACCEPTED',         42, 8500, 100),
      (v_bob, v_p3, NULL, 'cpp', NOW() - INTERVAL '45 days', 'TIME_LIMIT_EXCEEDED', 2000, 25000, 0),
      (v_bob, v_p3, NULL, 'cpp', NOW() - INTERVAL '44 days', 'ACCEPTED',        180, 15000, 100),
      (v_bob, v_p4, NULL, 'cpp', NOW() - INTERVAL '40 days', 'RUNTIME_ERROR',   NULL, NULL, 0),
      (v_bob, v_p4, NULL, 'cpp', NOW() - INTERVAL '39 days', 'ACCEPTED',        320, 20000, 100),
      (v_bob, v_p5, NULL, 'cpp', NOW() - INTERVAL '35 days', 'WRONG_ANSWER',    400, 18000, 0),
      (v_bob, v_p5, NULL, 'cpp', NOW() - INTERVAL '34 days', 'WRONG_ANSWER',    380, 18200, 0),
      (v_bob, v_p6, NULL, 'cpp', NOW() - INTERVAL '25 days', 'ACCEPTED',        120, 11000, 100);

    -- Contest #1 submissions (Round #1 was 30 days ago)
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_bob, v_p1, v_c1, 'cpp', NOW() - INTERVAL '30 days' + INTERVAL '15 min', 'ACCEPTED',      72, 9800, 100),
      (v_bob, v_p2, v_c1, 'cpp', NOW() - INTERVAL '30 days' + INTERVAL '35 min', 'ACCEPTED',      38, 8200, 100),
      (v_bob, v_p3, v_c1, 'cpp', NOW() - INTERVAL '30 days' + INTERVAL '90 min', 'WRONG_ANSWER', 195, 16000, 0);

    -- Contest #2 submissions (15 days ago)
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_bob, v_p4, v_c2, 'cpp', NOW() - INTERVAL '15 days' + INTERVAL '20 min', 'ACCEPTED',     310, 19500, 100),
      (v_bob, v_p5, v_c2, 'cpp', NOW() - INTERVAL '15 days' + INTERVAL '80 min', 'ACCEPTED',     450, 22000, 100);

    -- ═══════════════════════════════════════════════════════════════════════
    -- CHARLIE: Moderate user — 12 submissions
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_charlie, v_p1, NULL, 'cpp', NOW() - INTERVAL '48 days', 'ACCEPTED',           60, 9500, 100),
      (v_charlie, v_p2, NULL, 'cpp', NOW() - INTERVAL '46 days', 'COMPILATION_ERROR',  NULL, NULL, 0),
      (v_charlie, v_p2, NULL, 'cpp', NOW() - INTERVAL '45 days', 'ACCEPTED',           55, 9000, 100),
      (v_charlie, v_p3, NULL, 'cpp', NOW() - INTERVAL '42 days', 'ACCEPTED',          200, 14000, 100),
      (v_charlie, v_p5, NULL, 'cpp', NOW() - INTERVAL '38 days', 'MEMORY_LIMIT_EXCEEDED', 500, 600000, 0),
      (v_charlie, v_p5, NULL, 'cpp', NOW() - INTERVAL '37 days', 'ACCEPTED',          420, 21000, 100),
      (v_charlie, v_p7, NULL, 'cpp', NOW() - INTERVAL '20 days', 'WRONG_ANSWER',      350, 25000, 0),
      (v_charlie, v_p7, NULL, 'cpp', NOW() - INTERVAL '19 days', 'WRONG_ANSWER',      340, 24500, 0);

    -- Contest #1
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_charlie, v_p1, v_c1, 'cpp', NOW() - INTERVAL '30 days' + INTERVAL '10 min', 'ACCEPTED',     55, 9200, 100),
      (v_charlie, v_p2, v_c1, 'cpp', NOW() - INTERVAL '30 days' + INTERVAL '25 min', 'ACCEPTED',     50, 8800, 100),
      (v_charlie, v_p3, v_c1, 'cpp', NOW() - INTERVAL '30 days' + INTERVAL '70 min', 'ACCEPTED',    185, 13500, 100);

    -- Contest #2
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_charlie, v_p4, v_c2, 'cpp', NOW() - INTERVAL '15 days' + INTERVAL '45 min', 'ACCEPTED', 295, 18000, 100);

    -- ═══════════════════════════════════════════════════════════════════════
    -- DIANA: Strong user — 10 submissions, high acceptance rate
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_diana, v_p1, NULL, 'cpp', NOW() - INTERVAL '52 days', 'ACCEPTED',  48, 8800, 100),
      (v_diana, v_p2, NULL, 'cpp', NOW() - INTERVAL '51 days', 'ACCEPTED',  35, 8000, 100),
      (v_diana, v_p3, NULL, 'cpp', NOW() - INTERVAL '49 days', 'ACCEPTED', 170, 13000, 100),
      (v_diana, v_p4, NULL, 'cpp', NOW() - INTERVAL '43 days', 'ACCEPTED', 280, 17000, 100),
      (v_diana, v_p5, NULL, 'cpp', NOW() - INTERVAL '40 days', 'ACCEPTED', 390, 19000, 100),
      (v_diana, v_p6, NULL, 'cpp', NOW() - INTERVAL '36 days', 'ACCEPTED', 100, 10000, 100),
      (v_diana, v_p7, NULL, 'cpp', NOW() - INTERVAL '28 days', 'WRONG_ANSWER', 340, 24000, 0),
      (v_diana, v_p7, NULL, 'cpp', NOW() - INTERVAL '27 days', 'ACCEPTED', 310, 22000, 100),
      (v_diana, v_p8, NULL, 'cpp', NOW() - INTERVAL '22 days', 'ACCEPTED', 180, 12000, 100);

    -- Contest #1
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_diana, v_p1, v_c1, 'cpp', NOW() - INTERVAL '30 days' + INTERVAL '8 min', 'ACCEPTED', 42, 8500, 100);

    -- ═══════════════════════════════════════════════════════════════════════
    -- FRANK: Average user — 8 submissions
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_frank, v_p1, NULL, 'cpp', NOW() - INTERVAL '47 days', 'ACCEPTED',       75, 9800, 100),
      (v_frank, v_p2, NULL, 'cpp', NOW() - INTERVAL '44 days', 'WRONG_ANSWER',  100, 10500, 0),
      (v_frank, v_p2, NULL, 'cpp', NOW() - INTERVAL '43 days', 'ACCEPTED',       60, 9200, 100),
      (v_frank, v_p3, NULL, 'cpp', NOW() - INTERVAL '40 days', 'TIME_LIMIT_EXCEEDED', 2000, 30000, 0),
      (v_frank, v_p4, NULL, 'cpp', NOW() - INTERVAL '33 days', 'ACCEPTED',      350, 20000, 100),
      (v_frank, v_p6, NULL, 'cpp', NOW() - INTERVAL '26 days', 'RUNTIME_ERROR', NULL, NULL, 0);

    -- Contest #2
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_frank, v_p5, v_c2, 'cpp', NOW() - INTERVAL '15 days' + INTERVAL '60 min', 'WRONG_ANSWER', 500, 28000, 0),
      (v_frank, v_p4, v_c2, 'cpp', NOW() - INTERVAL '15 days' + INTERVAL '100 min', 'ACCEPTED',   330, 19000, 100);

    -- ═══════════════════════════════════════════════════════════════════════
    -- GRACE: Beginner — 6 submissions, mostly easy problems
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_grace, v_p1, NULL, 'cpp', NOW() - INTERVAL '30 days', 'COMPILATION_ERROR',  NULL, NULL, 0),
      (v_grace, v_p1, NULL, 'cpp', NOW() - INTERVAL '29 days', 'WRONG_ANSWER',       120, 11000, 0),
      (v_grace, v_p1, NULL, 'cpp', NOW() - INTERVAL '28 days', 'ACCEPTED',            90, 10500, 100),
      (v_grace, v_p2, NULL, 'cpp', NOW() - INTERVAL '24 days', 'ACCEPTED',            65, 9500, 100),
      (v_grace, v_p3, NULL, 'cpp', NOW() - INTERVAL '18 days', 'WRONG_ANSWER',       250, 18000, 0),
      (v_grace, v_p3, NULL, 'cpp', NOW() - INTERVAL '17 days', 'TIME_LIMIT_EXCEEDED', 2000, 35000, 0);

    -- ═══════════════════════════════════════════════════════════════════════
    -- IVY: Steady user — 9 submissions
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_ivy, v_p1, NULL, 'cpp', NOW() - INTERVAL '50 days', 'ACCEPTED',        55, 9200, 100),
      (v_ivy, v_p2, NULL, 'cpp', NOW() - INTERVAL '48 days', 'ACCEPTED',        40, 8400, 100),
      (v_ivy, v_p3, NULL, 'cpp', NOW() - INTERVAL '42 days', 'ACCEPTED',       175, 13500, 100),
      (v_ivy, v_p4, NULL, 'cpp', NOW() - INTERVAL '35 days', 'WRONG_ANSWER',   350, 22000, 0),
      (v_ivy, v_p4, NULL, 'cpp', NOW() - INTERVAL '34 days', 'ACCEPTED',       300, 19000, 100),
      (v_ivy, v_p5, NULL, 'cpp', NOW() - INTERVAL '28 days', 'ACCEPTED',       410, 20000, 100),
      (v_ivy, v_p6, NULL, 'cpp', NOW() - INTERVAL '22 days', 'ACCEPTED',       110, 10500, 100),
      (v_ivy, v_p8, NULL, 'cpp', NOW() - INTERVAL '15 days', 'WRONG_ANSWER',   200, 14000, 0),
      (v_ivy, v_p8, NULL, 'cpp', NOW() - INTERVAL '14 days', 'ACCEPTED',       165, 12500, 100);

    -- ═══════════════════════════════════════════════════════════════════════
    -- JACK: Sporadic user — 7 submissions across various days
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_jack, v_p1, NULL, 'cpp', NOW() - INTERVAL '53 days', 'ACCEPTED',       70, 9600, 100),
      (v_jack, v_p2, NULL, 'cpp', NOW() - INTERVAL '41 days', 'ACCEPTED',       48, 8600, 100),
      (v_jack, v_p6, NULL, 'cpp', NOW() - INTERVAL '30 days', 'ACCEPTED',      115, 10800, 100),
      (v_jack, v_p7, NULL, 'cpp', NOW() - INTERVAL '20 days', 'COMPILATION_ERROR', NULL, NULL, 0),
      (v_jack, v_p7, NULL, 'cpp', NOW() - INTERVAL '19 days', 'WRONG_ANSWER',  360, 25000, 0),
      (v_jack, v_p9, NULL, 'cpp', NOW() - INTERVAL '10 days', 'ACCEPTED',      450, 28000, 100);

    -- Contest #2
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_jack, v_p6, v_c2, 'cpp', NOW() - INTERVAL '15 days' + INTERVAL '30 min', 'ACCEPTED', 105, 10200, 100);

    -- ═══════════════════════════════════════════════════════════════════════
    -- EVE: Author who also solves (5 submissions, very high acceptance)
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      (v_eve, v_p1, NULL, 'cpp', NOW() - INTERVAL '56 days', 'ACCEPTED', 40, 8000, 100),
      (v_eve, v_p2, NULL, 'cpp', NOW() - INTERVAL '55 days', 'ACCEPTED', 30, 7500, 100),
      (v_eve, v_p3, NULL, 'cpp', NOW() - INTERVAL '50 days', 'ACCEPTED', 150, 12000, 100),
      (v_eve, v_p9, NULL, 'cpp', NOW() - INTERVAL '12 days', 'ACCEPTED', 400, 26000, 100),
      (v_eve, v_p10, NULL, 'cpp', NOW() - INTERVAL '8 days', 'ACCEPTED', 550, 32000, 100);

    -- ═══════════════════════════════════════════════════════════════════════
    -- Additional scattered submissions for heatmap variety
    -- (submissions on different days to create interesting activity patterns)
    -- ═══════════════════════════════════════════════════════════════════════
    INSERT INTO submissions (user_id, problem_id, contest_id, language, submission_time, status, execution_time, memory_used, score) VALUES
      -- Bob: extra activity on specific days
      (v_bob, v_p7, NULL, 'cpp', NOW() - INTERVAL '10 days', 'WRONG_ANSWER', 380, 26000, 0),
      (v_bob, v_p7, NULL, 'cpp', NOW() - INTERVAL '10 days' + INTERVAL '2 hours', 'WRONG_ANSWER', 370, 25500, 0),
      (v_bob, v_p8, NULL, 'cpp', NOW() - INTERVAL '5 days', 'WRONG_ANSWER', 200, 14000, 0),
      (v_bob, v_p8, NULL, 'cpp', NOW() - INTERVAL '5 days' + INTERVAL '3 hours', 'ACCEPTED', 175, 12000, 100),

      -- Charlie: activity bursts
      (v_charlie, v_p6, NULL, 'cpp', NOW() - INTERVAL '10 days', 'ACCEPTED', 108, 10300, 100),
      (v_charlie, v_p8, NULL, 'cpp', NOW() - INTERVAL '5 days', 'WRONG_ANSWER', 210, 15000, 0),
      (v_charlie, v_p9, NULL, 'cpp', NOW() - INTERVAL '3 days', 'WRONG_ANSWER', 480, 30000, 0),

      -- Diana: consistent daily activity
      (v_diana, v_p9, NULL, 'cpp', NOW() - INTERVAL '10 days', 'WRONG_ANSWER', 460, 29000, 0),
      (v_diana, v_p9, NULL, 'cpp', NOW() - INTERVAL '9 days', 'ACCEPTED', 440, 27000, 100),
      (v_diana, v_p10, NULL, 'cpp', NOW() - INTERVAL '5 days', 'WRONG_ANSWER', 600, 35000, 0),
      (v_diana, v_p10, NULL, 'cpp', NOW() - INTERVAL '4 days', 'WRONG_ANSWER', 580, 34000, 0),
      (v_diana, v_p10, NULL, 'cpp', NOW() - INTERVAL '3 days', 'ACCEPTED', 520, 30000, 100),

      -- Recent activity today (for heatmap "today" data)
      (v_bob,     v_p9, NULL, 'cpp', NOW() - INTERVAL '1 hour', 'WRONG_ANSWER', 470, 29500, 0),
      (v_charlie, v_p4, NULL, 'cpp', NOW() - INTERVAL '2 hours', 'ACCEPTED', 290, 17500, 100),
      (v_diana,   v_p6, v_c3, 'cpp', NOW() - INTERVAL '30 minutes', 'ACCEPTED', 95, 9800, 100);

END $$;


-- ============================================================================
-- 8. STANDINGS SNAPSHOTS (pre-built ICPC-style standings for ended contests)
-- This allows the contest standings page to render immediately without
-- needing the in-memory ScoreboardService to have processed submissions.
-- ============================================================================
DO $$
DECLARE
    v_c1 BIGINT; v_c2 BIGINT;
    v_c1_start TIMESTAMPTZ; v_c1_end TIMESTAMPTZ;
    v_c2_start TIMESTAMPTZ; v_c2_end TIMESTAMPTZ;
    v_p1 BIGINT; v_p2 BIGINT; v_p3 BIGINT;
    v_p4 BIGINT; v_p5 BIGINT; v_p6 BIGINT;
    v_bob BIGINT; v_charlie BIGINT; v_diana BIGINT;
    v_frank BIGINT; v_grace BIGINT; v_ivy BIGINT; v_jack BIGINT; v_eve BIGINT;
    v_json1 TEXT; v_json2 TEXT;
BEGIN
    SELECT id, start_time, end_time INTO v_c1, v_c1_start, v_c1_end FROM contest WHERE title = 'XorOJ Round #1';
    SELECT id, start_time, end_time INTO v_c2, v_c2_start, v_c2_end FROM contest WHERE title = 'XorOJ Round #2';

    SELECT id INTO v_p1 FROM problems WHERE title = 'Two Sum';
    SELECT id INTO v_p2 FROM problems WHERE title = 'Binary Search';
    SELECT id INTO v_p3 FROM problems WHERE title = 'DFS Traversal';
    SELECT id INTO v_p4 FROM problems WHERE title = 'Knapsack Problem';
    SELECT id INTO v_p5 FROM problems WHERE title = 'Shortest Path';
    SELECT id INTO v_p6 FROM problems WHERE title = 'String Matching';

    SELECT id INTO v_bob     FROM users WHERE username = 'bob';
    SELECT id INTO v_charlie FROM users WHERE username = 'charlie';
    SELECT id INTO v_diana   FROM users WHERE username = 'diana';
    SELECT id INTO v_frank   FROM users WHERE username = 'frank';
    SELECT id INTO v_grace   FROM users WHERE username = 'grace';
    SELECT id INTO v_ivy     FROM users WHERE username = 'ivy';
    SELECT id INTO v_jack    FROM users WHERE username = 'jack';
    SELECT id INTO v_eve     FROM users WHERE username = 'eve';

    -- ── Round #1 Standings (problems: Two Sum, Binary Search, DFS) ──
    -- Based on contest submissions:
    --   charlie: 3 solved (10+25+70 = 105 min penalty)
    --   bob:     2 solved (15+35 = 50 min penalty)
    --   diana:   1 solved (8 min penalty)
    --   frank, grace, ivy, jack: 0 solved
    v_json1 := format(
      '{"contestId":%s,"version":1,"problemIds":[%s,%s,%s],"rows":['
      || '{"userId":%s,"username":"charlie","solved":3,"penaltyMinutes":105,"cells":{"%s":{"firstSolved":true,"timeFromStartMin":10,"rejections":0},"%s":{"firstSolved":true,"timeFromStartMin":25,"rejections":0},"%s":{"firstSolved":true,"timeFromStartMin":70,"rejections":0}}}'
      || ',{"userId":%s,"username":"bob","solved":2,"penaltyMinutes":50,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":15,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":35,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":1}}}'
      || ',{"userId":%s,"username":"diana","solved":1,"penaltyMinutes":8,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":8,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"frank","solved":0,"penaltyMinutes":0,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"grace","solved":0,"penaltyMinutes":0,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"ivy","solved":0,"penaltyMinutes":0,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"jack","solved":0,"penaltyMinutes":0,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || '],"startEpochMs":%s,"endEpochMs":%s,"nowEpochMs":%s,"status":"ENDED"}',
      v_c1, v_p1, v_p2, v_p3,
      v_charlie, v_p1, v_p2, v_p3,
      v_bob, v_p1, v_p2, v_p3,
      v_diana, v_p1, v_p2, v_p3,
      v_frank, v_p1, v_p2, v_p3,
      v_grace, v_p1, v_p2, v_p3,
      v_ivy, v_p1, v_p2, v_p3,
      v_jack, v_p1, v_p2, v_p3,
      (EXTRACT(EPOCH FROM v_c1_start) * 1000)::BIGINT,
      (EXTRACT(EPOCH FROM v_c1_end) * 1000)::BIGINT,
      (EXTRACT(EPOCH FROM v_c1_end) * 1000)::BIGINT
    );

    -- ── Round #2 Standings (problems: Knapsack, Shortest Path, String Matching) ──
    -- Based on contest submissions:
    --   bob:     2 solved (20+80 = 100 min penalty)
    --   charlie: 1 solved (45 min penalty)
    --   frank:   1 solved (100 min + 20 penalty for 1 WA = 120 min)
    --   jack:    1 solved (30 min penalty)
    --   diana, eve: 0 solved
    v_json2 := format(
      '{"contestId":%s,"version":1,"problemIds":[%s,%s,%s],"rows":['
      || '{"userId":%s,"username":"bob","solved":2,"penaltyMinutes":100,"cells":{"%s":{"firstSolved":true,"timeFromStartMin":20,"rejections":0},"%s":{"firstSolved":true,"timeFromStartMin":80,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"charlie","solved":1,"penaltyMinutes":45,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":45,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"frank","solved":1,"penaltyMinutes":120,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":100,"rejections":1},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":1},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"jack","solved":1,"penaltyMinutes":30,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":30,"rejections":0}}}'
      || ',{"userId":%s,"username":"diana","solved":0,"penaltyMinutes":0,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || ',{"userId":%s,"username":"eve","solved":0,"penaltyMinutes":0,"cells":{"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0},"%s":{"firstSolved":false,"timeFromStartMin":null,"rejections":0}}}'
      || '],"startEpochMs":%s,"endEpochMs":%s,"nowEpochMs":%s,"status":"ENDED"}',
      v_c2, v_p4, v_p5, v_p6,
      v_bob, v_p4, v_p5, v_p6,
      v_charlie, v_p4, v_p5, v_p6,
      v_frank, v_p4, v_p5, v_p6,
      v_jack, v_p4, v_p5, v_p6,
      v_diana, v_p4, v_p5, v_p6,
      v_eve, v_p4, v_p5, v_p6,
      (EXTRACT(EPOCH FROM v_c2_start) * 1000)::BIGINT,
      (EXTRACT(EPOCH FROM v_c2_end) * 1000)::BIGINT,
      (EXTRACT(EPOCH FROM v_c2_end) * 1000)::BIGINT
    );

    -- Delete any existing snapshots for these contests and insert fresh ones
    DELETE FROM standings_snapshot WHERE contest_id IN (v_c1, v_c2);
    INSERT INTO standings_snapshot (contest_id, version, payload_json)
    VALUES (v_c1, 1, v_json1), (v_c2, 1, v_json2)
    ON CONFLICT (contest_id) DO UPDATE SET payload_json = EXCLUDED.payload_json, version = EXCLUDED.version;
END $$;


-- ============================================================================
-- 9. REFRESH MATERIALIZED VIEW
-- Must be done after all data is inserted so leaderboard/stats reflect data
-- ============================================================================
REFRESH MATERIALIZED VIEW mv_user_statistics;


-- ============================================================================
-- 10. INITIALIZE REFRESH TRACKER
-- ============================================================================
INSERT INTO mv_refresh_tracker (view_name, last_refresh)
VALUES ('mv_user_statistics', NOW())
ON CONFLICT (view_name) DO UPDATE SET last_refresh = NOW();


-- ============================================================================
-- 11. VERIFICATION QUERIES (optional — uncomment to check data)
-- ============================================================================

-- Check user count
-- SELECT 'Users' AS entity, COUNT(*) FROM users;

-- Check problem count and solve_counts (should be auto-updated by trigger)
-- SELECT id, title, solve_count, difficulty_rating FROM problems ORDER BY id;

-- Check contest count
-- SELECT id, title, status, start_time, end_time FROM contest ORDER BY id;

-- Check total submissions
-- SELECT 'Total Submissions' AS metric, COUNT(*) FROM submissions;

-- Check audit_log was populated by triggers
-- SELECT table_name, operation, COUNT(*) FROM audit_log GROUP BY table_name, operation ORDER BY table_name;

-- Test leaderboard
-- SELECT * FROM fn_global_leaderboard(10, 0);

-- Test user analytics for bob
-- SELECT * FROM fn_user_submission_analytics((SELECT id FROM users WHERE username = 'bob'));

-- Test activity heatmap for bob (last 60 days)
-- SELECT * FROM fn_user_activity_heatmap((SELECT id FROM users WHERE username = 'bob'), CURRENT_DATE - 60, CURRENT_DATE);

-- Test recommendations for grace (beginner)
-- SELECT * FROM fn_recommend_problems((SELECT id FROM users WHERE username = 'grace'), 5);

-- Test contest performance for bob
-- SELECT * FROM fn_user_contest_performance((SELECT id FROM users WHERE username = 'bob'));

-- Test platform stats
-- SELECT * FROM fn_platform_stats();

-- Test materialized view
-- SELECT * FROM mv_user_statistics ORDER BY problems_solved DESC;

-- Seed complete!
SELECT 'Seed data loaded successfully!' AS status,
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM problems) AS problems,
       (SELECT COUNT(*) FROM contest) AS contests,
       (SELECT COUNT(*) FROM submissions) AS submissions,
       (SELECT COUNT(*) FROM audit_log) AS audit_entries;
