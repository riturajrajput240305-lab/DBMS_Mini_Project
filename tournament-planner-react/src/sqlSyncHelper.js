export function parseSqlDatabase(sqlContent) {
  const venues = [];
  const venueRegex = /INSERT INTO VENUE VALUES \s*\(\s*(\d+),\s*'([^']+)',\s*'([^']+)',\s*(\d+)\s*\);/gi;
  let m;
  while ((m = venueRegex.exec(sqlContent)) !== null) {
    venues.push({ id: Number(m[1]), name: m[2], city: m[3], capacity: Number(m[4]) });
  }

  const teams = [];
  const teamRegex = /INSERT INTO TEAM VALUES \s*\(\s*(\d+),\s*'([^']+)',\s*'([^']+)',\s*([^,]+),\s*(\d+)\s*\);/gi;
  while ((m = teamRegex.exec(sqlContent)) !== null) {
    teams.push({
      id: String(m[1]),
      name: m[2],
      city: m[3],
      captainId: m[4].trim() === 'NULL' ? null : String(m[4].trim()),
      venueId: Number(m[5]),
    });
  }

  const players = [];
  const playerRegex = /INSERT INTO PLAYER VALUES \s*\(\s*(\d+),\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*(\d+),\s*'([^']+)'\s*\);/gi;
  while ((m = playerRegex.exec(sqlContent)) !== null) {
    players.push({
      id: String(m[1]),
      name: m[2],
      teamId: String(m[3]),
      role: m[4],
      age: Number(m[5]),
      nationality: m[6],
    });
  }

  const matches = [];
  const matchRegex = /INSERT INTO MATCH_SCHEDULE VALUES \s*\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*DATE '([^']+)',\s*'([^']+)',\s*'([^']+)'\s*\);/gi;
  while ((m = matchRegex.exec(sqlContent)) !== null) {
    const venue = venues.find((v) => v.id === Number(m[4]));
    matches.push({
      id: String(m[1]),
      homeId: String(m[2]),
      awayId: String(m[3]),
      venueId: Number(m[4]),
      venue: venue ? venue.name : 'Main Stadium',
      date: m[5],
      type: m[6],
      status: m[7],
      homeScore: 0,
      awayScore: 0,
    });
  }

  const scoreRegex = /INSERT INTO SCOREBOARD VALUES \s*\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+),\s*'([^']+)'\s*\);/gi;
  while ((m = scoreRegex.exec(sqlContent)) !== null) {
    const matchId = String(m[2]);
    const teamId = String(m[3]);
    const runs = Number(m[4]);
    const match = matches.find((x) => x.id === matchId);
    if (match) {
      if (match.homeId === teamId) match.homeScore = runs;
      if (match.awayId === teamId) match.awayScore = runs;
    }
  }

  const playerStats = [];
  const statRegex = /INSERT INTO PLAYER_STATS VALUES \s*\(\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*\);/gi;
  while ((m = statRegex.exec(sqlContent)) !== null) {
    playerStats.push({
      id: String(m[1]),
      playerId: String(m[2]),
      matchId: String(m[3]),
      runs: Number(m[4]),
      wickets: Number(m[5]),
      catches: Number(m[6]),
    });
  }

  return { venues, teams, players, matches, playerStats };
}

// Convert arbitrary alphanumeric/UUID IDs to clean positive Oracle numbers
function toNumericId(rawId, offset = 1) {
  if (/^\d+$/.test(String(rawId))) {
    return Number(rawId);
  }
  // deterministic hash
  let hash = 0;
  const str = String(rawId);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 9000;
  }
  return Math.abs(hash) + offset;
}

export function generateSqlDatabase({ teams = [], matches = [], players = [], playerStats = [], venues = [] }) {
  // Normalize team IDs to numbers
  const teamIdMap = new Map();
  teams.forEach((t, i) => {
    const numId = /^\d+$/.test(String(t.id)) ? Number(t.id) : i + 1;
    teamIdMap.set(String(t.id), numId);
  });

  // Ensure venues exist for all teams
  const effectiveVenues = [...venues];
  teams.forEach((t, i) => {
    const vId = i + 1;
    if (!effectiveVenues.some((v) => v.id === vId)) {
      effectiveVenues.push({
        id: vId,
        name: `${t.city || t.name} International Stadium`,
        city: t.city || 'Stadium City',
        capacity: 45000,
      });
    }
  });

  // Normalize player IDs
  const playerIdMap = new Map();
  players.forEach((p, i) => {
    const numId = /^\d+$/.test(String(p.id)) ? Number(p.id) : 100 + (i + 1);
    playerIdMap.set(String(p.id), numId);
  });

  // Normalize match IDs
  const matchIdMap = new Map();
  matches.forEach((m, i) => {
    const numId = /^\d+$/.test(String(m.id)) ? Number(m.id) : 1000 + (i + 1);
    matchIdMap.set(String(m.id), numId);
  });

  // Generate sections
  let sql = `-- =========================================================
-- TOURNEX: ONLINE SPORTS TOURNAMENT PLANNER
-- DBMS Mini Project | Oracle SQL | No PL/SQL
-- Single Source of Truth Database File
-- =========================================================
-- Execute from top to bottom in Oracle SQL Developer.

-- -------------------------
-- A. TABLE CREATION
-- -------------------------

DROP TABLE PLAYER_STATS CASCADE CONSTRAINTS;
DROP TABLE SCOREBOARD CASCADE CONSTRAINTS;
DROP TABLE MATCH_SCHEDULE CASCADE CONSTRAINTS;
DROP TABLE PLAYER CASCADE CONSTRAINTS;
DROP TABLE TEAM CASCADE CONSTRAINTS;
DROP TABLE VENUE CASCADE CONSTRAINTS;

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
-- B. PERSISTED DATA
-- -------------------------

`;

  // Venues
  effectiveVenues.forEach((v) => {
    sql += `INSERT INTO VENUE VALUES (${v.id}, '${v.name.replace(/'/g, "''")}', '${v.city.replace(/'/g, "''")}', ${v.capacity || 40000});\n`;
  });
  sql += '\n';

  // Teams
  teams.forEach((t, i) => {
    const tid = teamIdMap.get(String(t.id)) || (i + 1);
    const vId = (i % (effectiveVenues.length || 1)) + 1;
    sql += `INSERT INTO TEAM VALUES (${tid}, '${t.name.replace(/'/g, "''")}', '${t.city.replace(/'/g, "''")}', NULL, ${vId});\n`;
  });
  sql += '\n';

  // Players
  players.forEach((p, i) => {
    const pid = playerIdMap.get(String(p.id)) || (100 + i + 1);
    const tid = teamIdMap.get(String(p.teamId)) || 1;
    const role = ['Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].includes(p.role) ? p.role : 'Batter';
    const age = p.age || 25;
    const nat = p.nationality || 'India';
    sql += `INSERT INTO PLAYER VALUES (${pid}, '${p.name.replace(/'/g, "''")}', ${tid}, '${role}', ${age}, '${nat}');\n`;
  });
  sql += '\n';

  // Captains update
  teams.forEach((t) => {
    const tid = teamIdMap.get(String(t.id));
    const firstPlayer = players.find((p) => String(p.teamId) === String(t.id));
    if (firstPlayer) {
      const pid = playerIdMap.get(String(firstPlayer.id));
      if (pid) {
        sql += `UPDATE TEAM SET captain_id = ${pid} WHERE team_id = ${tid};\n`;
      }
    }
  });
  sql += '\n';

  // Match Schedule & Scoreboard
  let scoreId = 1;
  const scoreboardSql = [];

  matches.forEach((m, i) => {
    const mid = matchIdMap.get(String(m.id)) || (1000 + i + 1);
    const t1 = teamIdMap.get(String(m.homeId));
    const t2 = teamIdMap.get(String(m.awayId));
    if (!t1 || !t2) return;

    const vId = (i % (effectiveVenues.length || 1)) + 1;
    const dateStr = m.date || '2026-11-20';
    const status = ['Upcoming', 'Live', 'Completed'].includes(m.status) ? m.status : 'Upcoming';
    const type = m.type || 'League';

    sql += `INSERT INTO MATCH_SCHEDULE VALUES (${mid}, ${t1}, ${t2}, ${vId}, DATE '${dateStr}', '${type}', '${status}');\n`;

    if (status === 'Completed' || status === 'Live') {
      const hs = Number(m.homeScore || 0);
      const as = Number(m.awayScore || 0);
      let res1 = 'TIE';
      let res2 = 'TIE';
      if (hs > as) {
        res1 = 'WON';
        res2 = 'LOST';
      } else if (as > hs) {
        res1 = 'LOST';
        res2 = 'WON';
      }

      scoreboardSql.push(`INSERT INTO SCOREBOARD VALUES (${scoreId++}, ${mid}, ${t1}, ${hs}, 5, 20.0, '${res1}');`);
      scoreboardSql.push(`INSERT INTO SCOREBOARD VALUES (${scoreId++}, ${mid}, ${t2}, ${as}, 8, 20.0, '${res2}');`);
    }
  });
  sql += '\n';

  if (scoreboardSql.length > 0) {
    sql += scoreboardSql.join('\n') + '\n\n';
  }

  // Player Stats
  let statCount = 1;
  playerStats.forEach((st) => {
    const pid = playerIdMap.get(String(st.playerId));
    const mid = matchIdMap.get(String(st.matchId));
    if (pid && mid) {
      const runs = Number(st.runs || 0);
      const wickets = Math.min(10, Math.max(0, Number(st.wickets || 0)));
      const catches = Math.max(0, Number(st.catches || 0));
      sql += `INSERT INTO PLAYER_STATS VALUES (${statCount++}, ${pid}, ${mid}, ${runs}, ${wickets}, ${catches});\n`;
    }
  });

  sql += `
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
`;

  return sql;
}
