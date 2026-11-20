import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

const ROLES = ['Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

export default function PlayersPanel({ players, teams, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [message, setMessage] = useState('');
  const nameRef = useRef();

  const disabled = !teams.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const tid = teamId || teams[0]?.id;
    if (!tid) {
      setMessage('Add a team before adding players.');
      return;
    }
    onAdd(name.trim(), tid, role);
    setName('');
    setMessage('');
    nameRef.current?.focus();
  };

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(filterName.toLowerCase()) &&
      (!filterRole || p.role === filterRole)
  );

  return (
    <GlassCard delay={0.3} id="players">
      <p className="section-eyebrow">PLAYER MANAGEMENT</p>
      <div className="section-heading">
        <h2>Players by team</h2>
        <span className="section-count">{players.length} player{players.length !== 1 ? 's' : ''}</span>
      </div>

      <form className="glass-form" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label className="glass-label">
            Player name
            <input
              ref={nameRef}
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              required
            />
          </label>
          <label className="glass-label">
            Team
            <select
              className="glass-select"
              value={teamId || teams[0]?.id || ''}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={disabled}
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="glass-label">
            Role
            <select
              className="glass-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="filter-row">
          <label className="glass-label">
            Filter by name
            <input
              className="glass-input"
              type="search"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Search roster"
            />
          </label>
          <label className="glass-label">
            Filter by role
            <select
              className="glass-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
        <motion.button
          className="btn btn-primary"
          type="submit"
          disabled={disabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add player
        </motion.button>
        {message && <p className="form-message">{message}</p>}
      </form>

      <div className="roster-grid">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.p
              className="empty-msg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {players.length ? 'No players match these filters.' : 'No players added yet.'}
            </motion.p>
          )}
          {teams.map((team) => {
            const teamPlayers = filtered.filter((p) => p.teamId === team.id);
            if (!teamPlayers.length) return null;
            return (
              <motion.div
                key={team.id}
                className="roster-group"
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3>{team.name}</h3>
                {teamPlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    className="roster-player"
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <div>
                      <strong>{player.name}</strong>
                      <span>{player.role}</span>
                    </div>
                    <motion.button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(player.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

