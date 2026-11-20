import { useState, useCallback, useEffect, useRef } from 'react';
import { generateSqlDatabase } from './sqlSyncHelper';

const STORAGE_KEY = 'tournament-planner-data';

// Default initial dataset matching database.sql
const DEFAULT_SQL_SEED = {
  venues: [
    { id: 1, name: 'Wankhede Stadium', city: 'Mumbai', capacity: 33000 },
    { id: 2, name: 'M. Chinnaswamy Stadium', city: 'Bengaluru', capacity: 40000 },
    { id: 3, name: 'Eden Gardens', city: 'Kolkata', capacity: 68000 },
    { id: 4, name: 'Arun Jaitley Stadium', city: 'Delhi', capacity: 41000 },
    { id: 5, name: 'Narendra Modi Stadium', city: 'Ahmedabad', capacity: 132000 },
  ],
  teams: [
    { id: '1', name: 'Mumbai Mariners', city: 'Mumbai', venueId: 1 },
    { id: '2', name: 'Bengaluru Blazers', city: 'Bengaluru', venueId: 2 },
    { id: '3', name: 'Kolkata Knights', city: 'Kolkata', venueId: 3 },
    { id: '4', name: 'Delhi Dynamos', city: 'Delhi', venueId: 4 },
    { id: '5', name: 'Ahmedabad Titans', city: 'Ahmedabad', venueId: 5 },
  ],
  players: [
    { id: '101', name: 'Aarav Sharma', teamId: '1', role: 'Batter', age: 25, nationality: 'India' },
    { id: '102', name: 'Kabir Mehta', teamId: '1', role: 'Bowler', age: 27, nationality: 'India' },
    { id: '103', name: 'Vivaan Rao', teamId: '1', role: 'All-Rounder', age: 24, nationality: 'India' },
    { id: '201', name: 'Arjun Nair', teamId: '2', role: 'Batter', age: 26, nationality: 'India' },
    { id: '202', name: 'Reyansh Das', teamId: '2', role: 'Wicket-Keeper', age: 23, nationality: 'India' },
    { id: '203', name: 'Ishaan Roy', teamId: '2', role: 'Bowler', age: 28, nationality: 'India' },
    { id: '301', name: 'Aditya Sen', teamId: '3', role: 'Batter', age: 25, nationality: 'India' },
    { id: '302', name: 'Rudra Ghosh', teamId: '3', role: 'All-Rounder', age: 26, nationality: 'India' },
    { id: '401', name: 'Dhruv Kapoor', teamId: '4', role: 'Bowler', age: 24, nationality: 'India' },
    { id: '402', name: 'Atharv Jain', teamId: '4', role: 'Batter', age: 27, nationality: 'India' },
    { id: '501', name: 'Vihaan Patel', teamId: '5', role: 'Wicket-Keeper', age: 25, nationality: 'India' },
    { id: '502', name: 'Krish Malhotra', teamId: '5', role: 'Bowler', age: 29, nationality: 'India' },
  ],
  matches: [
    {
      id: '1001',
      homeId: '1',
      awayId: '2',
      venueId: 1,
      venue: 'Wankhede Stadium',
      date: '2026-11-01',
      type: 'League',
      status: 'Completed',
      homeScore: 186,
      awayScore: 172,
    },
    {
      id: '1002',
      homeId: '3',
      awayId: '4',
      venueId: 3,
      venue: 'Eden Gardens',
      date: '2026-11-03',
      type: 'League',
      status: 'Completed',
      homeScore: 164,
      awayScore: 165,
    },
    {
      id: '1003',
      homeId: '5',
      awayId: '1',
      venueId: 5,
      venue: 'Narendra Modi Stadium',
      date: '2026-11-12',
      type: 'League',
      status: 'Upcoming',
      homeScore: 0,
      awayScore: 0,
    },
    {
      id: '1004',
      homeId: '2',
      awayId: '3',
      venueId: 2,
      venue: 'M. Chinnaswamy Stadium',
      date: '2026-11-14',
      type: 'League',
      status: 'Upcoming',
      homeScore: 0,
      awayScore: 0,
    },
    {
      id: '1005',
      homeId: '4',
      awayId: '5',
      venueId: 4,
      venue: 'Arun Jaitley Stadium',
      date: '2026-11-16',
      type: 'League',
      status: 'Upcoming',
      homeScore: 0,
      awayScore: 0,
    },
  ],
  playerStats: [
    { id: '1', playerId: '101', matchId: '1001', runs: 78, wickets: 0, catches: 1 },
    { id: '2', playerId: '102', matchId: '1001', runs: 5, wickets: 3, catches: 0 },
    { id: '3', playerId: '103', matchId: '1001', runs: 32, wickets: 1, catches: 2 },
    { id: '4', playerId: '201', matchId: '1001', runs: 45, wickets: 0, catches: 0 },
    { id: '5', playerId: '203', matchId: '1001', runs: 12, wickets: 2, catches: 1 },
    { id: '6', playerId: '301', matchId: '1002', runs: 51, wickets: 0, catches: 0 },
    { id: '7', playerId: '302', matchId: '1002', runs: 20, wickets: 1, catches: 2 },
    { id: '8', playerId: '402', matchId: '1002', runs: 67, wickets: 0, catches: 1 },
    { id: '9', playerId: '401', matchId: '1002', runs: 4, wickets: 2, catches: 0 },
  ],
};

function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SQL_SEED;
    const data = JSON.parse(raw);
    if (!data.teams || data.teams.length === 0) return DEFAULT_SQL_SEED;
    return {
      venues: data.venues || DEFAULT_SQL_SEED.venues,
      teams: data.teams || [],
      matches: data.matches || [],
      players: data.players || [],
      playerStats: data.playerStats || [],
    };
  } catch {
    return DEFAULT_SQL_SEED;
  }
}

export function useStore() {
  const [state, setState] = useState(loadLocalState);
  const [sqlSyncStatus, setSqlSyncStatus] = useState('synced');
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const isInitialMount = useRef(true);

  // Synchronize with database.sql on the filesystem via API
  const syncWithSqlFile = useCallback(async (stateToSync) => {
    try {
      setSqlSyncStatus('saving');
      const res = await fetch('/api/sql-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSync),
      });
      if (res.ok) {
        setSqlSyncStatus('synced');
        setLastSyncTime(Date.now());
      } else {
        setSqlSyncStatus('error');
      }
    } catch {
      // Local fallback
      setSqlSyncStatus('synced-local');
    }
  }, []);

  // On mount, load directly from database.sql
  useEffect(() => {
    async function loadFromSql() {
      try {
        const res = await fetch('/api/sql-data');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.teams && json.data.teams.length > 0) {
            setState(json.data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
            setSqlSyncStatus('synced');
            setLastSyncTime(Date.now());
          }
        }
      } catch (err) {
        console.warn('Could not reach /api/sql-data, using local fallback:', err);
      }
    }
    loadFromSql();
  }, []);

  const update = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        syncWithSqlFile(next);
        return next;
      });
    },
    [syncWithSqlFile]
  );

  // Teams
  const addTeam = useCallback(
    (name, city) => {
      update((s) => {
        const newId = String(s.teams.length + 1);
        return {
          ...s,
          teams: [...s.teams, { id: newId, name, city, venueId: s.teams.length + 1 }],
        };
      });
    },
    [update]
  );

  const deleteTeam = useCallback(
    (teamId) => {
      update((s) => {
        const removedPlayerIds = new Set(
          s.players.filter((p) => String(p.teamId) === String(teamId)).map((p) => p.id)
        );
        const removedMatchIds = new Set(
          s.matches
            .filter((m) => String(m.homeId) === String(teamId) || String(m.awayId) === String(teamId))
            .map((m) => m.id)
        );
        return {
          ...s,
          teams: s.teams.filter((t) => String(t.id) !== String(teamId)),
          matches: s.matches.filter(
            (m) => String(m.homeId) !== String(teamId) && String(m.awayId) !== String(teamId)
          ),
          players: s.players.filter((p) => String(p.teamId) !== String(teamId)),
          playerStats: s.playerStats.filter(
            (st) =>
              !removedPlayerIds.has(st.playerId) &&
              !removedMatchIds.has(st.matchId)
          ),
        };
      });
    },
    [update]
  );

  // Players
  const addPlayer = useCallback(
    (name, teamId, role) => {
      update((s) => {
        const newId = String(100 + s.players.length + 1);
        return {
          ...s,
          players: [
            ...s.players,
            { id: newId, name, teamId: String(teamId), role, age: 25, nationality: 'India' },
          ],
        };
      });
    },
    [update]
  );

  const deletePlayer = useCallback(
    (playerId) => {
      update((s) => ({
        ...s,
        players: s.players.filter((p) => String(p.id) !== String(playerId)),
        playerStats: s.playerStats.filter((st) => String(st.playerId) !== String(playerId)),
      }));
    },
    [update]
  );

  // Matches
  const addOrUpdateMatch = useCallback(
    (match) => {
      update((s) => {
        const id = match.id ? String(match.id) : String(1000 + s.matches.length + 1);
        const existing = s.matches.findIndex((m) => String(m.id) === id);
        const newMatch = { ...match, id };
        const matches =
          existing === -1
            ? [...s.matches, newMatch]
            : s.matches.map((m) => (String(m.id) === id ? newMatch : m));
        return { ...s, matches };
      });
    },
    [update]
  );

  const deleteMatch = useCallback(
    (matchId) => {
      update((s) => ({
        ...s,
        matches: s.matches.filter((m) => String(m.id) !== String(matchId)),
        playerStats: s.playerStats.filter((st) => String(st.matchId) !== String(matchId)),
      }));
    },
    [update]
  );

  // Player Stats
  const addOrUpdateStat = useCallback(
    (stat) => {
      update((s) => {
        const id = stat.id ? String(stat.id) : String(s.playerStats.length + 1);
        const existing = s.playerStats.findIndex((st) => String(st.id) === id);
        const newStat = { ...stat, id };
        const playerStats =
          existing === -1
            ? [...s.playerStats, newStat]
            : s.playerStats.map((st) => (String(st.id) === id ? newStat : st));
        return { ...s, playerStats };
      });
    },
    [update]
  );

  const deleteStat = useCallback(
    (statId) => {
      update((s) => ({
        ...s,
        playerStats: s.playerStats.filter((st) => String(st.id) !== String(statId)),
      }));
    },
    [update]
  );

  // Reset to default seed or clear
  const clearAll = useCallback(() => {
    update({ venues: [], teams: [], matches: [], players: [], playerStats: [] });
  }, [update]);

  const resetToSqlSeed = useCallback(() => {
    update(DEFAULT_SQL_SEED);
  }, [update]);

  // Export current state as SQL string
  const getGeneratedSql = useCallback(() => {
    return generateSqlDatabase(state);
  }, [state]);

  // Standings computation (Points Table)
  const standings = state.teams
    .map((team) => {
      const entry = { team, played: 0, won: 0, lost: 0, points: 0 };
      state.matches
        .filter((m) => m.status === 'Completed')
        .forEach((m) => {
          if (String(m.homeId) !== String(team.id) && String(m.awayId) !== String(team.id)) return;
          entry.played++;
          const hs = Number(m.homeScore || 0);
          const as = Number(m.awayScore || 0);
          const isHome = String(m.homeId) === String(team.id);
          if (hs === as) {
            entry.points++;
          } else if ((isHome && hs > as) || (!isHome && as > hs)) {
            entry.won++;
            entry.points += 2;
          } else {
            entry.lost++;
          }
        });
      return entry;
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.won - a.won ||
        a.team.name.localeCompare(b.team.name)
    );

  return {
    state,
    standings,
    sqlSyncStatus,
    lastSyncTime,
    addTeam,
    deleteTeam,
    addPlayer,
    deletePlayer,
    addOrUpdateMatch,
    deleteMatch,
    addOrUpdateStat,
    deleteStat,
    clearAll,
    resetToSqlSeed,
    getGeneratedSql,
  };
}
