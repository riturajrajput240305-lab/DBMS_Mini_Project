import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import './PublicMatchesView.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PublicMatchesView({ matches, teams }) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredMatches = matches
    .filter((m) => {
      if (filterStatus === 'ALL') return true;
      return m.status === filterStatus;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const liveCount = matches.filter((m) => m.status === 'Live').length;
  const upcomingCount = matches.filter((m) => m.status === 'Upcoming').length;
  const completedCount = matches.filter((m) => m.status === 'Completed').length;

  return (
    <GlassCard delay={0.2} id="matches" className="public-matches-card">
      <div className="public-heading-row">
        <div>
          <p className="section-eyebrow">TOURNAMENT FIXTURES & RESULTS</p>
          <h2>Match Center</h2>
          <p className="public-subtext">Real-time match scores, upcoming fixtures, and verified results.</p>
        </div>

        <div className="status-filter-pills">
          <button
            className={`filter-pill ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
            type="button"
          >
            All ({matches.length})
          </button>
          <button
            className={`filter-pill ${filterStatus === 'Live' ? 'active live-pill' : ''}`}
            onClick={() => setFilterStatus('Live')}
            type="button"
          >
            <span className="live-pulse-dot" /> Live ({liveCount})
          </button>
          <button
            className={`filter-pill ${filterStatus === 'Upcoming' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Upcoming')}
            type="button"
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            className={`filter-pill ${filterStatus === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Completed')}
            type="button"
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      <div className="public-match-grid">
        <AnimatePresence mode="popLayout">
          {filteredMatches.length === 0 ? (
            <motion.div
              className="public-empty-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">🏏</div>
              <h3>No matches to display</h3>
              <p>
                {matches.length === 0
                  ? 'Fixtures scheduled by tournament organizers in the Admin view will appear here instantly.'
                  : `No ${filterStatus.toLowerCase()} matches found.`}
              </p>
            </motion.div>
          ) : (
            filteredMatches.map((match) => {
              const home = teams.find((t) => t.id === match.homeId);
              const away = teams.find((t) => t.id === match.awayId);
              if (!home || !away) return null;

              const isCompleted = match.status === 'Completed';
              const isLive = match.status === 'Live';
              const homeScore = Number(match.homeScore || 0);
              const awayScore = Number(match.awayScore || 0);

              let resultSummary = '';
              if (isCompleted) {
                if (homeScore > awayScore) {
                  resultSummary = `${home.name} won by ${homeScore - awayScore} runs/points`;
                } else if (awayScore > homeScore) {
                  resultSummary = `${away.name} won by ${awayScore - homeScore} runs/points`;
                } else {
                  resultSummary = 'Match Tied';
                }
              }

              return (
                <motion.div
                  key={match.id}
                  className={`public-match-item ${isLive ? 'is-live' : ''}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="match-card-header">
                    <span className="match-meta-date">📅 {formatDate(match.date)}</span>
                    <span className={`status-badge badge-${match.status.toLowerCase()}`}>
                      {isLive && <span className="live-blink-circle" />}
                      {match.status}
                    </span>
                  </div>

                  <div className="match-teams-display">
                    {/* Home Team */}
                    <div className="team-row">
                      <div className="team-badge">
                        <span className="team-avatar">{home.name.charAt(0)}</span>
                        <div className="team-info">
                          <strong className="team-name">{home.name}</strong>
                          <span className="team-city">{home.city}</span>
                        </div>
                      </div>
                      {(isCompleted || isLive) && (
                        <span className={`team-score ${isCompleted && homeScore > awayScore ? 'winner' : ''}`}>
                          {match.homeScore}
                        </span>
                      )}
                    </div>

                    <div className="vs-divider">
                      <span>vs</span>
                    </div>

                    {/* Away Team */}
                    <div className="team-row">
                      <div className="team-badge">
                        <span className="team-avatar">{away.name.charAt(0)}</span>
                        <div className="team-info">
                          <strong className="team-name">{away.name}</strong>
                          <span className="team-city">{away.city}</span>
                        </div>
                      </div>
                      {(isCompleted || isLive) && (
                        <span className={`team-score ${isCompleted && awayScore > homeScore ? 'winner' : ''}`}>
                          {match.awayScore}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="match-card-footer">
                    <span className="match-venue">📍 {match.venue}</span>
                    {resultSummary && <span className="match-outcome">{resultSummary}</span>}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

