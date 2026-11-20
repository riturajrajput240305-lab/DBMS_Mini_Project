import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PublicStatsView({ playerStats, players, matches, teams }) {
  const sorted = [...playerStats].sort((a, b) => {
    const ma = matches.find((m) => m.id === a.matchId);
    const mb = matches.find((m) => m.id === b.matchId);
    return (mb?.date || '').localeCompare(ma?.date || '');
  });

  return (
    <GlassCard delay={0.4} id="player-stats">
      <div className="public-heading-row">
        <div>
          <p className="section-eyebrow">MATCH HIGHLIGHTS</p>
          <h2>Player Performance Leaderboard</h2>
          <p className="public-subtext">Verified match statistics for top performers.</p>
        </div>
        <span className="section-count">{playerStats.length} {playerStats.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-msg">No player statistics recorded yet.</p>
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
                      <td>{home?.name || 'Team'} vs {away?.name || 'Team'} · {formatDate(match.date)}</td>
                      <td><strong style={{ color: '#fff' }}>{stat.runs}</strong></td>
                      <td><strong style={{ color: '#fff' }}>{stat.wickets}</strong></td>
                      <td><strong style={{ color: '#fff' }}>{stat.catches}</strong></td>
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

