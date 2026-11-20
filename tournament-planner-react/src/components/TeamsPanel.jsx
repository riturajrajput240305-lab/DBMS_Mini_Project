import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

export default function TeamsPanel({ teams, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const nameRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;
    onAdd(name.trim(), city.trim());
    setName('');
    setCity('');
    nameRef.current?.focus();
  };

  return (
    <GlassCard delay={0.1} id="teams">
      <p className="section-eyebrow">TEAM MANAGEMENT</p>
      <div className="section-heading">
        <h2>Teams</h2>
        <span className="section-count">{teams.length} team{teams.length !== 1 ? 's' : ''}</span>
      </div>

      <form className="glass-form" onSubmit={handleSubmit}>
        <label className="glass-label">
          Team name
          <input
            ref={nameRef}
            className="glass-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mumbai Mariners"
            required
          />
        </label>
        <label className="glass-label">
          City
          <input
            className="glass-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
            required
          />
        </label>
        <motion.button
          className="btn btn-primary"
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add team
        </motion.button>
      </form>

      <div className="list-container">
        <AnimatePresence mode="popLayout">
          {teams.length === 0 && (
            <motion.p
              className="empty-msg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No teams added yet.
            </motion.p>
          )}
          {teams.map((team) => (
            <motion.div
              key={team.id}
              className="list-item"
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="list-item__info">
                <strong>{team.name}</strong>
                <span>{team.city}</span>
              </div>
              <motion.button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(team.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Delete
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

