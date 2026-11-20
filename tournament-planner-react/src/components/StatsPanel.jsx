import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function StatsPanel({ playerStats, players, matches, teams, onAddOrUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    playerId: '',
    matchId: '',
    runs: 0,
    wickets: 0,
    catches: 0,
  });
  const [message, setMessage] = useState('');

  const disabled = !players.length || !matches.length;

  const resetForm = () => {
    setEditing(null);
    setForm({
      playerId: players[0]?.id || '',
      matchId: matches[0]?.id || '',
      runs: 0,
      wickets: 0,
      catches: 0,
    });
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.playerId || !form.matchId) {
      setMessage('Add at least one player and one match.');
      return;
    }

    const duplicate = playerStats.find(
      (s) =>
        s.playerId === form.playerId &&
        s.matchId === form.matchId &&
        s.id !== editing
    );
    if (duplicate) {
      setMessage('This player already has stats for the selected match.');
      return;
    }

    onAddOrUpdate({
      id: editing || undefined,
      playerId: form.playerId,
      matchId: form.matchId,
      runs: Number(form.runs || 0),
      wickets: Number(form.wickets || 0),
      catches: Number(form.catches || 0),
    });
    resetForm();
  };

  const startEdit = (stat) => {
    setEditing(stat.id);
    setForm({
      playerId: stat.playerId,
      matchId: stat.matchId,
      runs: stat.runs,
      wickets: stat.wickets,
      catches: stat.catches,
    });
  };

  const matchLabel = (m) => {
    const home = teams.find((t) => t.id === m.homeId);
    const away = teams.find((t) => t.id === m.awayId);
    return `${home?.name || 'Team'} vs ${away?.name || 'Team'} · ${formatDate(m.date)}`;
  };

  const sorted = [...playerStats].sort((a, b) => {
    const ma = matches.find((m) => m.id === a.matchId);
    const mb = matches.find((m) => m.id === b.matchId);
    return (mb?.date || '').localeCompare(ma?.date || '');
  });

  return (
    <GlassCard delay={0.4} id="player-stats">
      <p className="section-eyebrow">MATCH PERFORMANCE</p>
      <div className="section-heading">
        <h2>Player stats</h2>
        <span className="section-count">{playerStats.length} {playerStats.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      <form className="glass-form" onSubmit={handleSubmit}>
        <div className="form-grid-5">
          <label className="glass-label">
            Player
            <select
              className="glass-select"
              value={form.playerId || players[0]?.id || ''}
              onChange={(e) => setForm((f) => ({ ...f, playerId: e.target.value }))}
              disabled={disabled}
              required
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="glass-label">
            Match
            <select
              className="glass-select"
              value={form.matchId || matches[0]?.id || ''}
              onChange={(e) => setForm((f) => ({ ...f, matchId: e.target.value }))}
              disabled={disabled}
              required
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>{matchLabel(m)}</option>
              ))}
            </select>
          </label>
          <label className="glass-label">
            Runs
            <input
              className="glass-input"
              type="number"
              min="0"
              value={form.runs}
              onChange={(e) => setForm((f) => ({ ...f, runs: e.target.value }))}
              required
            />
          </label>
          <label className="glass-label">
            Wickets
            <input
              className="glass-input"
              type="number"
              min="0"
              max="10"
              value={form.wickets}
              onChange={(e) => setForm((f) => ({ ...f, wickets: e.target.value }))}
              required
            />
          </label>
          <label className="glass-label">
            Catches
            <input
              className="glass-input"
              type="number"
              min="0"
              value={form.catches}
              onChange={(e) => setForm((f) => ({ ...f, catches: e.target.value }))}
              required
            />
          </label>
        </div>
        <div className="form-actions">
          <motion.button
            className="btn btn-primary"
            type="submit"
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {editing ? 'Save stats' : 'Add stats'}
          </motion.button>
          {editing && (
            <motion.button
              className="btn btn-secondary"
              type="button"
              onClick={resetForm}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Cancel edit
            </motion.button>
          )}
        </div>
        {message && <p className="form-message">{message}</p>}
      </form>

      {sorted.length === 0 ? (
        <p className="empty-msg">Add players and matches to record player stats.</p>
      ) : (
        <div className="glass-table-wrap">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Match</th>
                <th>Runs</th>
                <th>Wkts</th>
                <th>Catches</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sorted.map((stat) => {
                  const player = players.find((p) => p.id === stat.playerId);
                  const match = matches.find((m) => m.id === stat.matchId);
                  if (!player || !match) return null;
                  const home = teams.find((t) => t.id === match.homeId);
                  const away = teams.find((t) => t.id === match.awayId);
                  return (
                    <motion.tr
                      key={stat.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                    >
                      <td className="table-emphasis">{player.name}</td>
                      <td>{home?.name || 'Team'} vs {away?.name || 'Team'}</td>
                      <td>{stat.runs}</td>
                      <td>{stat.wickets}</td>
                      <td>{stat.catches}</td>
                      <td className="stats-actions">
                        <motion.button
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(stat)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(stat.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}

