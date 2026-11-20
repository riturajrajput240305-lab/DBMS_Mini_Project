import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function MatchesPanel({ matches, teams, onAddOrUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    homeId: '',
    awayId: '',
    date: '',
    venue: '',
    status: 'Upcoming',
    homeScore: 0,
    awayScore: 0,
  });
  const [message, setMessage] = useState('');

  const disabled = teams.length < 2;

  const resetForm = () => {
    setEditing(null);
    setForm({
      homeId: teams[0]?.id || '',
      awayId: teams[1]?.id || '',
      date: '',
      venue: '',
      status: 'Upcoming',
      homeScore: 0,
      awayScore: 0,
    });
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.homeId === form.awayId) {
      setMessage('Choose two different teams.');
      return;
    }
    onAddOrUpdate({
      id: editing || undefined,
      homeId: form.homeId,
      awayId: form.awayId,
      date: form.date,
      venue: form.venue.trim(),
      status: form.status,
      homeScore: form.homeScore === '' ? 0 : Number(form.homeScore),
      awayScore: form.awayScore === '' ? 0 : Number(form.awayScore),
    });
    resetForm();
  };

  const startEdit = (match) => {
    setEditing(match.id);
    setForm({
      homeId: match.homeId,
      awayId: match.awayId,
      date: match.date,
      venue: match.venue,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    });
  };

  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <GlassCard delay={0.2} id="matches">
      <p className="section-eyebrow">MANUAL FIXTURES</p>
      <div className="section-heading">
        <h2>Matches</h2>
        <span className="section-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
      </div>

      <form className="glass-form" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label className="glass-label">
            Team 1
            <select
              className="glass-select"
              value={form.homeId}
              onChange={(e) => setForm((f) => ({ ...f, homeId: e.target.value }))}
              disabled={disabled}
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="glass-label">
            Team 2
            <select
              className="glass-select"
              value={form.awayId}
              onChange={(e) => setForm((f) => ({ ...f, awayId: e.target.value }))}
              disabled={disabled}
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="glass-label">
            Date
            <input
              className="glass-input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </label>
          <label className="glass-label">
            Venue
            <input
              className="glass-input"
              value={form.venue}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              placeholder="e.g. Main stadium"
              required
            />
          </label>
          <label className="glass-label">
            Status
            <select
              className="glass-select"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option>Upcoming</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
          </label>
          <label className="glass-label">
            Team 1 score
            <input
              className="glass-input"
              type="number"
              min="0"
              value={form.homeScore}
              onChange={(e) => setForm((f) => ({ ...f, homeScore: e.target.value }))}
            />
          </label>
          <label className="glass-label">
            Team 2 score
            <input
              className="glass-input"
              type="number"
              min="0"
              value={form.awayScore}
              onChange={(e) => setForm((f) => ({ ...f, awayScore: e.target.value }))}
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
            {editing ? 'Save changes' : 'Add match'}
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

      <div className="list-container">
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 && (
            <motion.p
              className="empty-msg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No matches scheduled yet.
            </motion.p>
          )}
          {sorted.map((match) => {
            const home = teams.find((t) => t.id === match.homeId);
            const away = teams.find((t) => t.id === match.awayId);
            if (!home || !away) return null;
            return (
              <motion.div
                key={match.id}
                className="list-item"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="list-item__info">
                  <strong>{home.name} vs {away.name}</strong>
                  <span>
                    {formatDate(match.date)} · {match.venue} · {match.status}
                    {match.status === 'Completed' && ` · Score ${match.homeScore}-${match.awayScore}`}
                  </span>
                </div>
                <div className="list-item__actions">
                  <motion.button
                    className="btn btn-secondary btn-sm"
                    onClick={() => startEdit(match)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(match.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

