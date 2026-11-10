-- =========================================================
-- TOURNEX: ONLINE SPORTS TOURNAMENT PLANNER
-- DBMS Mini Project | Oracle SQL | No PL/SQL
-- =========================================================
-- Execute from top to bottom in Oracle SQL Developer.

-- -------------------------
-- A. TABLE CREATION
-- -------------------------

CREATE TABLE VENUE (
    venue_id   NUMBER(4) PRIMARY KEY,
    venue_name VARCHAR2(80) NOT NULL,
    city       VARCHAR2(40) NOT NULL,
    capacity   NUMBER(8) CHECK (capacity > 0)
);

CREATE TABLE TEAM (
    team_id       NUMBER(4) PRIMARY KEY,
    team_name     VARCHAR2(60) NOT NULL UNIQUE,
    city          VARCHAR2(40) NOT NULL,
    captain_id    NUMBER(4),
    home_venue_id NUMBER(4),
    CONSTRAINT fk_team_venue FOREIGN KEY (home_venue_id)
        REFERENCES VENUE(venue_id)
);

CREATE TABLE PLAYER (
    player_id   NUMBER(4) PRIMARY KEY,
    player_name VARCHAR2(70) NOT NULL,
    team_id     NUMBER(4) NOT NULL,
    role        VARCHAR2(20) NOT NULL
        CHECK (role IN ('Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper')),
    age         NUMBER(2) CHECK (age BETWEEN 15 AND 60),
    nationality VARCHAR2(40),
    CONSTRAINT fk_player_team FOREIGN KEY (team_id)
        REFERENCES TEAM(team_id)
);

-- Add captain relationship after PLAYER exists.
ALTER TABLE TEAM ADD CONSTRAINT fk_team_captain
    FOREIGN KEY (captain_id) REFERENCES PLAYER(player_id);

CREATE TABLE MATCH_SCHEDULE (
    match_id    NUMBER(4) PRIMARY KEY,
    team1_id    NUMBER(4) NOT NULL,
    team2_id    NUMBER(4) NOT NULL,
    venue_id    NUMBER(4) NOT NULL,
    match_date  DATE NOT NULL,
    match_type  VARCHAR2(20) DEFAULT 'League',
    match_status VARCHAR2(20) DEFAULT 'Upcoming'
        CHECK (match_status IN ('Upcoming', 'Live', 'Completed')),
    CONSTRAINT fk_match_team1 FOREIGN KEY (team1_id) REFERENCES TEAM(team_id),
    CONSTRAINT fk_match_team2 FOREIGN KEY (team2_id) REFERENCES TEAM(team_id),
    CONSTRAINT fk_match_venue FOREIGN KEY (venue_id) REFERENCES VENUE(venue_id),
    CONSTRAINT chk_different_teams CHECK (team1_id <> team2_id)
);

CREATE TABLE SCOREBOARD (
    score_id    NUMBER(4) PRIMARY KEY,
    match_id    NUMBER(4) NOT NULL,
    team_id     NUMBER(4) NOT NULL,
    runs        NUMBER(4) DEFAULT 0 CHECK (runs >= 0),
    wickets     NUMBER(2) DEFAULT 0 CHECK (wickets BETWEEN 0 AND 10),
    overs       NUMBER(4,1) DEFAULT 0,
    result_status VARCHAR2(10) NOT NULL
        CHECK (result_status IN ('WON', 'LOST', 'TIE', 'NR')),
    CONSTRAINT fk_score_match FOREIGN KEY (match_id) REFERENCES MATCH_SCHEDULE(match_id),
    CONSTRAINT fk_score_team FOREIGN KEY (team_id) REFERENCES TEAM(team_id),
    CONSTRAINT uq_match_team UNIQUE (match_id, team_id)
);

CREATE TABLE PLAYER_STATS (
    stat_id   NUMBER(4) PRIMARY KEY,
    player_id NUMBER(4) NOT NULL,
    match_id  NUMBER(4) NOT NULL,
    runs      NUMBER(4) DEFAULT 0 CHECK (runs >= 0),
    wickets   NUMBER(2) DEFAULT 0 CHECK (wickets BETWEEN 0 AND 10),
    catches   NUMBER(2) DEFAULT 0 CHECK (catches >= 0),
    CONSTRAINT fk_stats_player FOREIGN KEY (player_id) REFERENCES PLAYER(player_id),
    CONSTRAINT fk_stats_match FOREIGN KEY (match_id) REFERENCES MATCH_SCHEDULE(match_id),
    CONSTRAINT uq_player_match UNIQUE (player_id, match_id)
);

-- -------------------------
-- B. SAMPLE DATA
-- -------------------------

INSERT INTO VENUE VALUES (1, 'Wankhede Stadium', 'Mumbai', 33000);
INSERT INTO VENUE VALUES (2, 'M. Chinnaswamy Stadium', 'Bengaluru', 40000);
INSERT INTO VENUE VALUES (3, 'Eden Gardens', 'Kolkata', 68000);
INSERT INTO VENUE VALUES (4, 'Arun Jaitley Stadium', 'Delhi', 41000);
INSERT INTO VENUE VALUES (5, 'Narendra Modi Stadium', 'Ahmedabad', 132000);

INSERT INTO TEAM VALUES (1, 'Mumbai Mariners', 'Mumbai', NULL, 1);
INSERT INTO TEAM VALUES (2, 'Bengaluru Blazers', 'Bengaluru', NULL, 2);
INSERT INTO TEAM VALUES (3, 'Kolkata Knights', 'Kolkata', NULL, 3);
INSERT INTO TEAM VALUES (4, 'Delhi Dynamos', 'Delhi', NULL, 4);
INSERT INTO TEAM VALUES (5, 'Ahmedabad Titans', 'Ahmedabad', NULL, 5);

INSERT INTO PLAYER VALUES (101, 'Aarav Sharma', 1, 'Batter', 25, 'India');
INSERT INTO PLAYER VALUES (102, 'Kabir Mehta', 1, 'Bowler', 27, 'India');
INSERT INTO PLAYER VALUES (103, 'Vivaan Rao', 1, 'All-Rounder', 24, 'India');
INSERT INTO PLAYER VALUES (201, 'Arjun Nair', 2, 'Batter', 26, 'India');
INSERT INTO PLAYER VALUES (202, 'Reyansh Das', 2, 'Wicket-Keeper', 23, 'India');
INSERT INTO PLAYER VALUES (203, 'Ishaan Roy', 2, 'Bowler', 28, 'India');
INSERT INTO PLAYER VALUES (301, 'Aditya Sen', 3, 'Batter', 25, 'India');
INSERT INTO PLAYER VALUES (302, 'Rudra Ghosh', 3, 'All-Rounder', 26, 'India');
INSERT INTO PLAYER VALUES (401, 'Dhruv Kapoor', 4, 'Bowler', 24, 'India');
INSERT INTO PLAYER VALUES (402, 'Atharv Jain', 4, 'Batter', 27, 'India');
INSERT INTO PLAYER VALUES (501, 'Vihaan Patel', 5, 'Wicket-Keeper', 25, 'India');
INSERT INTO PLAYER VALUES (502, 'Krish Malhotra', 5, 'Bowler', 29, 'India');

UPDATE TEAM SET captain_id = 101 WHERE team_id = 1;
UPDATE TEAM SET captain_id = 201 WHERE team_id = 2;
UPDATE TEAM SET captain_id = 301 WHERE team_id = 3;
UPDATE TEAM SET captain_id = 402 WHERE team_id = 4;
UPDATE TEAM SET captain_id = 501 WHERE team_id = 5;

INSERT INTO MATCH_SCHEDULE VALUES (1001, 1, 2, 1, DATE '2026-11-01', 'League', 'Completed');
INSERT INTO MATCH_SCHEDULE VALUES (1002, 3, 4, 3, DATE '2026-11-03', 'League', 'Completed');
INSERT INTO MATCH_SCHEDULE VALUES (1003, 5, 1, 5, DATE '2026-11-12', 'League', 'Upcoming');
INSERT INTO MATCH_SCHEDULE VALUES (1004, 2, 3, 2, DATE '2026-11-14', 'League', 'Upcoming');
INSERT INTO MATCH_SCHEDULE VALUES (1005, 4, 5, 4, DATE '2026-11-16', 'League', 'Upcoming');

INSERT INTO SCOREBOARD VALUES (1, 1001, 1, 186, 5, 20.0, 'WON');
INSERT INTO SCOREBOARD VALUES (2, 1001, 2, 172, 8, 20.0, 'LOST');
INSERT INTO SCOREBOARD VALUES (3, 1002, 3, 164, 7, 20.0, 'LOST');
INSERT INTO SCOREBOARD VALUES (4, 1002, 4, 165, 4, 19.2, 'WON');

INSERT INTO PLAYER_STATS VALUES (1, 101, 1001, 78, 0, 1);
INSERT INTO PLAYER_STATS VALUES (2, 102, 1001, 5, 3, 0);
INSERT INTO PLAYER_STATS VALUES (3, 103, 1001, 32, 1, 2);
INSERT INTO PLAYER_STATS VALUES (4, 201, 1001, 45, 0, 0);
INSERT INTO PLAYER_STATS VALUES (5, 203, 1001, 12, 2, 1);
INSERT INTO PLAYER_STATS VALUES (6, 301, 1002, 51, 0, 0);
INSERT INTO PLAYER_STATS VALUES (7, 302, 1002, 20, 1, 2);
INSERT INTO PLAYER_STATS VALUES (8, 402, 1002, 67, 0, 1);
INSERT INTO PLAYER_STATS VALUES (9, 401, 1002, 4, 2, 0);

COMMIT;

-- -------------------------
-- C. REQUIRED DBMS QUERIES
-- -------------------------

-- 1. Display all teams and their home venues.
SELECT t.team_id, t.team_name, t.city, v.venue_name
FROM TEAM t
JOIN VENUE v ON t.home_venue_id = v.venue_id
ORDER BY t.team_id;

-- 2. LIKE operator: search players whose names begin with 'A'.
SELECT player_id, player_name, role, team_id
FROM PLAYER
WHERE UPPER(player_name) LIKE 'A%';

-- 3. Pattern matching: find all players with 'ar' anywhere in the name.
SELECT player_name, role
FROM PLAYER
WHERE LOWER(player_name) LIKE '%ar%';

-- 4. Filter player roster by role (example: all bowlers).
SELECT p.player_name, p.role, t.team_name
FROM PLAYER p
JOIN TEAM t ON p.team_id = t.team_id
WHERE p.role LIKE '%Bowler%';

-- 5. Upcoming match schedule.
SELECT m.match_id, t1.team_name AS team_1, t2.team_name AS team_2,
       v.venue_name, m.match_date, m.match_status
FROM MATCH_SCHEDULE m
JOIN TEAM t1 ON m.team1_id = t1.team_id
JOIN TEAM t2 ON m.team2_id = t2.team_id
JOIN VENUE v ON m.venue_id = v.venue_id
WHERE m.match_status = 'Upcoming'
ORDER BY m.match_date;

-- 6. Complex subquery: calculate points from match results.
-- Win = 2 points, Tie/No Result = 1 point, Loss = 0 points.
SELECT t.team_id, t.team_name,
       (SELECT COUNT(*)
          FROM SCOREBOARD s
         WHERE s.team_id = t.team_id
           AND s.result_status = 'WON') AS matches_won,
       (SELECT COUNT(*)
          FROM SCOREBOARD s
         WHERE s.team_id = t.team_id
           AND s.result_status IN ('TIE', 'NR')) AS tied_or_no_result,
       (SELECT COUNT(*)
          FROM SCOREBOARD s
         WHERE s.team_id = t.team_id) AS matches_played,
       2 * (SELECT COUNT(*)
              FROM SCOREBOARD s
             WHERE s.team_id = t.team_id
               AND s.result_status = 'WON')
       + (SELECT COUNT(*)
            FROM SCOREBOARD s
           WHERE s.team_id = t.team_id
             AND s.result_status IN ('TIE', 'NR')) AS points
FROM TEAM t
ORDER BY points DESC, matches_won DESC, t.team_name;

-- 7. Points table with ranking and net run rate-style run difference.
SELECT DENSE_RANK() OVER (ORDER BY points DESC, wins DESC, run_difference DESC) AS position,
       team_name, played, wins, losses, points, run_difference
FROM (
    SELECT t.team_id, t.team_name,
           COUNT(s.score_id) AS played,
           SUM(CASE WHEN s.result_status = 'WON' THEN 1 ELSE 0 END) AS wins,
           SUM(CASE WHEN s.result_status = 'LOST' THEN 1 ELSE 0 END) AS losses,
           SUM(CASE WHEN s.result_status = 'WON' THEN 2
                    WHEN s.result_status IN ('TIE', 'NR') THEN 1
                    ELSE 0 END) AS points,
           NVL(SUM(CASE WHEN s.result_status = 'WON' THEN s.runs
                        WHEN s.result_status = 'LOST' THEN -s.runs
                        ELSE 0 END), 0) AS run_difference
    FROM TEAM t
    LEFT JOIN SCOREBOARD s ON t.team_id = s.team_id
    GROUP BY t.team_id, t.team_name
);

-- 8. Subquery: players who scored more than the average runs per innings.
SELECT p.player_name, ps.runs
FROM PLAYER p
JOIN PLAYER_STATS ps ON p.player_id = ps.player_id
WHERE ps.runs > (SELECT AVG(runs) FROM PLAYER_STATS);

-- 9. Aggregate player statistics by team.
SELECT t.team_name, SUM(ps.runs) AS total_runs,
       SUM(ps.wickets) AS total_wickets,
       SUM(ps.catches) AS total_catches
FROM TEAM t
JOIN PLAYER p ON t.team_id = p.team_id
JOIN PLAYER_STATS ps ON p.player_id = ps.player_id
GROUP BY t.team_name
ORDER BY total_runs DESC;

-- 10. Match scorecard.
SELECT m.match_id, t.team_name, s.runs, s.wickets, s.overs, s.result_status
FROM SCOREBOARD s
JOIN MATCH_SCHEDULE m ON s.match_id = m.match_id
JOIN TEAM t ON s.team_id = t.team_id
ORDER BY m.match_id, s.runs DESC;

-- 11. Players belonging to teams based in cities containing 'a'.
SELECT p.player_name, t.team_name, t.city
FROM PLAYER p
JOIN TEAM t ON p.team_id = t.team_id
WHERE LOWER(t.city) LIKE '%a%';

-- -------------------------
-- D. USEFUL INDEXES
-- -------------------------
CREATE INDEX idx_player_name ON PLAYER(player_name);
CREATE INDEX idx_player_role ON PLAYER(role);
CREATE INDEX idx_match_date ON MATCH_SCHEDULE(match_date);
CREATE INDEX idx_score_match ON SCOREBOARD(match_id);

-- -------------------------
-- E. VERIFICATION
-- -------------------------
SELECT COUNT(*) AS total_teams FROM TEAM;
SELECT COUNT(*) AS total_players FROM PLAYER;
SELECT COUNT(*) AS total_matches FROM MATCH_SCHEDULE;
SELECT COUNT(*) AS completed_matches FROM MATCH_SCHEDULE
WHERE match_status = 'Completed';
