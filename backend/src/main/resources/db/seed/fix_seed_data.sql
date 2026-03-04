-- ============================================================================
-- Fix Script for Seed Data
-- Fixes: problem authorship, duplicate contests, problem_num, standings
-- ============================================================================

-- ============================================================================
-- 1. REASSIGN DUMMY PROBLEMS TO sssatty (id=1) SO THEY APPEAR IN YOUR DROPDOWN
-- ============================================================================
UPDATE problems SET author_id = 1 WHERE title IN (
  'Two Sum', 'Binary Search', 'DFS Traversal', 'Knapsack Problem',
  'Shortest Path', 'String Matching', 'Segment Tree', 'Matrix Exponent',
  'Convex Hull', 'Network Flow'
);

-- ============================================================================
-- 2. SET problem_num FOR ALL SEED PROBLEMS (so they display properly)
-- ============================================================================
UPDATE problems SET problem_num = 1 WHERE title = 'Two Sum';
UPDATE problems SET problem_num = 2 WHERE title = 'Binary Search';
UPDATE problems SET problem_num = 3 WHERE title = 'DFS Traversal';
UPDATE problems SET problem_num = 4 WHERE title = 'Knapsack Problem';
UPDATE problems SET problem_num = 5 WHERE title = 'Shortest Path';
UPDATE problems SET problem_num = 6 WHERE title = 'String Matching';
UPDATE problems SET problem_num = 7 WHERE title = 'Segment Tree';
UPDATE problems SET problem_num = 8 WHERE title = 'Matrix Exponent';
UPDATE problems SET problem_num = 9 WHERE title = 'Convex Hull';
UPDATE problems SET problem_num = 10 WHERE title = 'Network Flow';

-- ============================================================================
-- 3. REASSIGN DUMMY CONTESTS TO sssatty (id=1) SO YOU CAN EDIT THEM
-- ============================================================================
UPDATE contest SET author_id = 1 WHERE id IN (4, 5, 6, 7);

-- ============================================================================
-- 4. DELETE DUPLICATE CONTESTS (IDs 8-11 are duplicates from running seed twice)
-- ============================================================================
-- First remove their submissions, participants, and problem links
DELETE FROM submissions WHERE contest_id IN (8, 9, 10, 11);
DELETE FROM contest_participants WHERE contest_id IN (8, 9, 10, 11);
DELETE FROM contest_problems WHERE contest_id IN (8, 9, 10, 11);
DELETE FROM contest WHERE id IN (8, 9, 10, 11);

-- Also clean up empty contest id=2 and id=12 if they're blank
DELETE FROM contest_participants WHERE contest_id IN (2, 12);
DELETE FROM contest_problems WHERE contest_id IN (2, 12);
DELETE FROM standings_snapshot WHERE contest_id IN (2, 12);
DELETE FROM contest WHERE id IN (2, 12) AND (title IS NULL OR title = '');

-- ============================================================================
-- 5. FIX contest_id = 0 -> NULL FOR NON-CONTEST SUBMISSIONS
-- ============================================================================
UPDATE submissions SET contest_id = NULL WHERE contest_id = 0;

-- ============================================================================
-- 6. ADD sssatty AS PARTICIPANT IN THE ENDED CONTESTS (so you can view them)
-- ============================================================================
INSERT INTO contest_participants (contest_id, user_id) VALUES (4, 1) ON CONFLICT DO NOTHING;
INSERT INTO contest_participants (contest_id, user_id) VALUES (5, 1) ON CONFLICT DO NOTHING;
INSERT INTO contest_participants (contest_id, user_id) VALUES (6, 1) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. BUILD STANDINGS SNAPSHOTS FOR ENDED CONTESTS
--    These must match the StandingsDTO JSON structure expected by the backend.
-- ============================================================================

-- Delete old broken snapshots
DELETE FROM standings_snapshot;

-- Build standings for Contest 4 (XorOJ Round #1)
-- Problems: Two Sum (3), Binary Search (4), DFS Traversal (5)
-- Contest was 30 days ago, 2 hours duration
-- Participants & results:
--   diana: solved Two Sum at +8min => AC at 8, penalty=8
--   charlie: Two Sum +10min AC, Binary Search +25min AC, DFS +70min AC => 3 solved, penalty=105
--   bob: Two Sum +15min AC, Binary Search +35min AC, DFS +90min WA => 2 solved, penalty=50
--   frank, grace, ivy, jack: no contest submissions in round #1
DO $$
DECLARE
    v_c1 BIGINT := 4;
    v_p1 BIGINT; v_p2 BIGINT; v_p3 BIGINT;
    v_bob BIGINT; v_charlie BIGINT; v_diana BIGINT;
    v_frank BIGINT; v_grace BIGINT; v_ivy BIGINT; v_jack BIGINT;
    v_start TIMESTAMP;
    v_end TIMESTAMP;
    v_start_ms BIGINT;
    v_end_ms BIGINT;
    v_now_ms BIGINT;
    v_json TEXT;
BEGIN
    SELECT id INTO v_p1 FROM problems WHERE title = 'Two Sum';
    SELECT id INTO v_p2 FROM problems WHERE title = 'Binary Search';
    SELECT id INTO v_p3 FROM problems WHERE title = 'DFS Traversal';
    SELECT id INTO v_bob FROM users WHERE username = 'bob';
    SELECT id INTO v_charlie FROM users WHERE username = 'charlie';
    SELECT id INTO v_diana FROM users WHERE username = 'diana';
    SELECT id INTO v_frank FROM users WHERE username = 'frank';
    SELECT id INTO v_grace FROM users WHERE username = 'grace';
    SELECT id INTO v_ivy FROM users WHERE username = 'ivy';
    SELECT id INTO v_jack FROM users WHERE username = 'jack';

    SELECT start_time, end_time INTO v_start, v_end FROM contest WHERE id = v_c1;
    v_start_ms := EXTRACT(EPOCH FROM v_start) * 1000;
    v_end_ms := EXTRACT(EPOCH FROM v_end) * 1000;
    v_now_ms := EXTRACT(EPOCH FROM NOW()) * 1000;

    v_json := '{' ||
      '"contestId":' || v_c1 || ',' ||
      '"version":1,' ||
      '"problemIds":[' || v_p1 || ',' || v_p2 || ',' || v_p3 || '],' ||
      '"rows":[' ||
        -- charlie: 3 solved, penalty = 10+25+70 = 105
        '{"userId":' || v_charlie || ',"username":"charlie","solved":3,"penaltyMinutes":105,"cells":{' ||
          '"' || v_p1 || '":{"firstSolved":false,"timeFromStartMin":10,"rejections":0},' ||
          '"' || v_p2 || '":{"firstSolved":false,"timeFromStartMin":25,"rejections":0},' ||
          '"' || v_p3 || '":{"firstSolved":false,"timeFromStartMin":70,"rejections":0}' ||
        '}},' ||
        -- bob: 2 solved, penalty = 15+35 = 50
        '{"userId":' || v_bob || ',"username":"bob","solved":2,"penaltyMinutes":50,"cells":{' ||
          '"' || v_p1 || '":{"firstSolved":false,"timeFromStartMin":15,"rejections":0},' ||
          '"' || v_p2 || '":{"firstSolved":false,"timeFromStartMin":35,"rejections":0},' ||
          '"' || v_p3 || '":{"firstSolved":false,"timeFromStartMin":null,"rejections":1}' ||
        '}},' ||
        -- diana: 1 solved, penalty = 8
        '{"userId":' || v_diana || ',"username":"diana","solved":1,"penaltyMinutes":8,"cells":{' ||
          '"' || v_p1 || '":{"firstSolved":true,"timeFromStartMin":8,"rejections":0}' ||
        '}},' ||
        -- frank: 0 solved
        '{"userId":' || v_frank || ',"username":"frank","solved":0,"penaltyMinutes":0,"cells":{}},' ||
        -- grace: 0 solved
        '{"userId":' || v_grace || ',"username":"grace","solved":0,"penaltyMinutes":0,"cells":{}},' ||
        -- ivy: 0 solved
        '{"userId":' || v_ivy || ',"username":"ivy","solved":0,"penaltyMinutes":0,"cells":{}},' ||
        -- jack: 0 solved
        '{"userId":' || v_jack || ',"username":"jack","solved":0,"penaltyMinutes":0,"cells":{}}' ||
      '],' ||
      '"startEpochMs":' || v_start_ms || ',' ||
      '"endEpochMs":' || v_end_ms || ',' ||
      '"nowEpochMs":' || v_now_ms || ',' ||
      '"status":"ENDED"' ||
    '}';

    INSERT INTO standings_snapshot (contest_id, version, payload_json, finalized, updated_at)
    VALUES (v_c1, 1, v_json, true, NOW())
    ON CONFLICT (contest_id) DO UPDATE SET
      payload_json = EXCLUDED.payload_json,
      version = EXCLUDED.version,
      finalized = EXCLUDED.finalized,
      updated_at = EXCLUDED.updated_at;
END $$;


-- Build standings for Contest 5 (XorOJ Round #2)
-- Problems: Knapsack (6), Shortest Path (7), String Matching (8)
-- Contest was 15 days ago, 3 hours duration
-- Participants & results:
--   bob: Knapsack +20min AC, Shortest Path +80min AC => 2 solved, penalty=100
--   charlie: Knapsack +45min AC => 1 solved, penalty=45
--   jack: String Matching +30min AC => 1 solved, penalty=30
--   frank: Shortest Path WA, Knapsack +100min AC => 1 solved, penalty=100+20=120
--   diana, eve: no contest submissions in round #2
DO $$
DECLARE
    v_c2 BIGINT := 5;
    v_p4 BIGINT; v_p5 BIGINT; v_p6 BIGINT;
    v_bob BIGINT; v_charlie BIGINT; v_diana BIGINT;
    v_eve BIGINT; v_frank BIGINT; v_jack BIGINT;
    v_start TIMESTAMP;
    v_end TIMESTAMP;
    v_start_ms BIGINT;
    v_end_ms BIGINT;
    v_now_ms BIGINT;
    v_json TEXT;
BEGIN
    SELECT id INTO v_p4 FROM problems WHERE title = 'Knapsack Problem';
    SELECT id INTO v_p5 FROM problems WHERE title = 'Shortest Path';
    SELECT id INTO v_p6 FROM problems WHERE title = 'String Matching';
    SELECT id INTO v_bob FROM users WHERE username = 'bob';
    SELECT id INTO v_charlie FROM users WHERE username = 'charlie';
    SELECT id INTO v_diana FROM users WHERE username = 'diana';
    SELECT id INTO v_eve FROM users WHERE username = 'eve';
    SELECT id INTO v_frank FROM users WHERE username = 'frank';
    SELECT id INTO v_jack FROM users WHERE username = 'jack';

    SELECT start_time, end_time INTO v_start, v_end FROM contest WHERE id = v_c2;
    v_start_ms := EXTRACT(EPOCH FROM v_start) * 1000;
    v_end_ms := EXTRACT(EPOCH FROM v_end) * 1000;
    v_now_ms := EXTRACT(EPOCH FROM NOW()) * 1000;

    v_json := '{' ||
      '"contestId":' || v_c2 || ',' ||
      '"version":1,' ||
      '"problemIds":[' || v_p4 || ',' || v_p5 || ',' || v_p6 || '],' ||
      '"rows":[' ||
        -- bob: 2 solved, penalty=100
        '{"userId":' || v_bob || ',"username":"bob","solved":2,"penaltyMinutes":100,"cells":{' ||
          '"' || v_p4 || '":{"firstSolved":true,"timeFromStartMin":20,"rejections":0},' ||
          '"' || v_p5 || '":{"firstSolved":true,"timeFromStartMin":80,"rejections":0}' ||
        '}},' ||
        -- jack: 1 solved, penalty=30
        '{"userId":' || v_jack || ',"username":"jack","solved":1,"penaltyMinutes":30,"cells":{' ||
          '"' || v_p6 || '":{"firstSolved":true,"timeFromStartMin":30,"rejections":0}' ||
        '}},' ||
        -- charlie: 1 solved, penalty=45
        '{"userId":' || v_charlie || ',"username":"charlie","solved":1,"penaltyMinutes":45,"cells":{' ||
          '"' || v_p4 || '":{"firstSolved":false,"timeFromStartMin":45,"rejections":0}' ||
        '}},' ||
        -- frank: 1 solved, penalty=120 (100 + 20 for 1 WA)
        '{"userId":' || v_frank || ',"username":"frank","solved":1,"penaltyMinutes":120,"cells":{' ||
          '"' || v_p5 || '":{"firstSolved":false,"timeFromStartMin":null,"rejections":1},' ||
          '"' || v_p4 || '":{"firstSolved":false,"timeFromStartMin":100,"rejections":0}' ||
        '}},' ||
        -- diana: 0 solved
        '{"userId":' || v_diana || ',"username":"diana","solved":0,"penaltyMinutes":0,"cells":{}},' ||
        -- eve: 0 solved
        '{"userId":' || v_eve || ',"username":"eve","solved":0,"penaltyMinutes":0,"cells":{}}' ||
      '],' ||
      '"startEpochMs":' || v_start_ms || ',' ||
      '"endEpochMs":' || v_end_ms || ',' ||
      '"nowEpochMs":' || v_now_ms || ',' ||
      '"status":"ENDED"' ||
    '}';

    INSERT INTO standings_snapshot (contest_id, version, payload_json, finalized, updated_at)
    VALUES (v_c2, 1, v_json, true, NOW())
    ON CONFLICT (contest_id) DO UPDATE SET
      payload_json = EXCLUDED.payload_json,
      version = EXCLUDED.version,
      finalized = EXCLUDED.finalized,
      updated_at = EXCLUDED.updated_at;
END $$;


-- ============================================================================
-- 8. REFRESH MATERIALIZED VIEW
-- ============================================================================
REFRESH MATERIALIZED VIEW mv_user_statistics;


-- ============================================================================
-- 9. VERIFY
-- ============================================================================
SELECT 'Fix applied!' AS status;
SELECT id, title, author_id, problem_num FROM problems ORDER BY id;
SELECT id, title, author_id, status FROM contest ORDER BY id;
SELECT contest_id, length(payload_json) as json_len, finalized FROM standings_snapshot;
