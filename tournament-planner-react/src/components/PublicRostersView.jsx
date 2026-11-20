import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

export default function PublicRostersView({ teams, players }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const filteredPlayers = players.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || p.role === selectedRole;
    return matchesName && matchesRole;
  });

  return (
    <GlassCard delay={0.3} id="players">
      <div className="public-heading-row">
        <div>
          <p className="section-eyebrow">TEAMS & PLAYER ROSTERS</p>
          <h2>Tournament Squads</h2>
          <p className="public-subtext">Browse verified squad rosters and player profiles.</p>
        </div>

        <div className="filter-row" style={{ maxWidth: '480px', width: '100%', marginBottom: 0 }}>
          <input
            type="search"
            className="glass-input"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="glass-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="Batter">Batters</option>
            <option value="Bowler">Bowlers</option>
            <option value="All-Rounder">All-Rounders</option>
            <option value="Wicket-Keeper">Wicket-Keepers</option>
          </select>
        </div>
      </div>

      <div className="roster-grid">
        <AnimatePresence mode="popLayout">
          {teams.length === 0 ? (
            <p className="empty-msg" style={{ gridColumn: '1 / -1' }}>
              No teams or players registered yet.
            </p>
          ) : (
            teams.map((team) => {
              const teamPlayers = filteredPlayers.filter((p) => p.teamId === team.id);
              return (
                <motion.div
                  key={team.id}
                  className="roster-group"
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0 }}>{team.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{team.city}</span>
                  </div>

                  {teamPlayers.length === 0 ? (
                    <p className="empty-msg" style={{ fontSize: '12px' }}>
                      {players.some((p) => p.teamId === team.id)
                        ? 'No players match current filter'
                        : 'No squad members listed'}
                    </p>
                  ) : (
                    teamPlayers.map((player) => (
                      <div key={player.id} className="roster-player">
                        <div>
                          <strong>{player.name}</strong>
                          <span>{player.role}</span>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--gray-500)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {player.role}
                        </span>
                      </div>
                    ))
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

