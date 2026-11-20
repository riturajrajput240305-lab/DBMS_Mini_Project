import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

export default function StandingsPanel({ standings }) {
  return (
    <GlassCard delay={0.5} id="standings">
      <p className="section-eyebrow">REAL-TIME SUBQUERY VIEW</p>
      <div className="section-heading">
        <h2>Points table</h2>
        <span className="section-count">2 points per win · 1 for a tie</span>
      </div>

      {standings.length === 0 ? (
        <p className="empty-msg">Add teams to build the points table.</p>
      ) : (
        <div className="glass-table-wrap">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>Played</th>
                <th>Won</th>
                <th>Lost</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {standings.map((entry, index) => (
                  <motion.tr
                    key={entry.team.id}
                    layout
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td>{String(index + 1).padStart(2, '0')}</td>
                    <td className="table-emphasis">{entry.team.name}</td>
                    <td>{entry.played}</td>
                    <td>{entry.won}</td>
                    <td>{entry.lost}</td>
                    <td className="table-emphasis">{entry.points}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}

