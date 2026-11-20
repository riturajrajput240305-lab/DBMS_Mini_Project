import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store';
import Starfield from './components/Starfield';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LoginModal from './components/LoginModal';
import SqlViewerModal from './components/SqlViewerModal';

// Admin panels
import TeamsPanel from './components/TeamsPanel';
import MatchesPanel from './components/MatchesPanel';
import PlayersPanel from './components/PlayersPanel';
import StatsPanel from './components/StatsPanel';
import StandingsPanel from './components/StandingsPanel';

// Public views
import PublicMatchesView from './components/PublicMatchesView';
import PublicRostersView from './components/PublicRostersView';
import PublicStatsView from './components/PublicStatsView';

import Footer from './components/Footer';
import './components/shared.css';
import './App.css';

const AUTH_KEY = 'tournament-planner-admin-auth';

const PUBLIC_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'matches', label: 'Matches' },
  { id: 'standings', label: 'Standings' },
  { id: 'players', label: 'Squads' },
  { id: 'player-stats', label: 'Stats' },
];

const ADMIN_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'teams', label: 'Teams' },
  { id: 'matches', label: 'Matches' },
  { id: 'players', label: 'Players' },
  { id: 'player-stats', label: 'Stats' },
  { id: 'standings', label: 'Standings' },
];

export default function App() {
  const {
    state,
    standings,
    sqlSyncStatus,
    addTeam,
    deleteTeam,
    addPlayer,
    deletePlayer,
    addOrUpdateMatch,
    deleteMatch,
    addOrUpdateStat,
    deleteStat,
    clearAll,
    getGeneratedSql,
  } = useStore();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true' ? 'admin' : 'public';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const sections = viewMode === 'admin' ? ADMIN_SECTIONS : PUBLIC_SECTIONS;
  const currentSection = sections[activeSectionIndex] || sections[0];

  const lastWheelTime = useRef(0);

  // Keep active index in bounds when switching view modes
  useEffect(() => {
    setActiveSectionIndex(0);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setViewMode('admin');
    setIsLoginModalOpen(false);
    setActiveSectionIndex(0);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setViewMode('public');
    setActiveSectionIndex(0);
  };

  const handleToggleView = () => {
    setViewMode((prev) => (prev === 'admin' ? 'public' : 'admin'));
    setActiveSectionIndex(0);
  };

  const handleSelectSectionById = (id) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx !== -1) setActiveSectionIndex(idx);
  };

  // Keyboard navigation: ArrowUp/Down / PageUp/Down
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        setActiveSectionIndex((i) => Math.min(sections.length - 1, i + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveSectionIndex((i) => Math.max(0, i - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sections.length]);

  // Mouse wheel / trackpad page navigation
  const handleWheel = useCallback(
    (e) => {
      // If modal is open, don't trigger deck navigation
      if (isLoginModalOpen || isSqlModalOpen) return;

      const now = Date.now();
      if (now - lastWheelTime.current < 650) return; // Debounce

      if (Math.abs(e.deltaY) > 35) {
        if (e.deltaY > 0) {
          // Scroll Down -> Next Card
          setActiveSectionIndex((i) => {
            if (i < sections.length - 1) {
              lastWheelTime.current = now;
              return i + 1;
            }
            return i;
          });
        } else {
          // Scroll Up -> Prev Card
          setActiveSectionIndex((i) => {
            if (i > 0) {
              lastWheelTime.current = now;
              return i - 1;
            }
            return i;
          });
        }
      }
    },
    [sections.length, isLoginModalOpen, isSqlModalOpen]
  );

  const handleClearAll = () => {
    if (
      !state.teams.length &&
      !state.matches.length &&
      !state.players.length &&
      !state.playerStats.length
    ) {
      alert('There is no data to clear.');
      return;
    }
    if (
      window.confirm(
        'Are you sure you want to remove ALL teams, fixtures, rosters and match statistics? This will also update database.sql on disk.'
      )
    ) {
      clearAll();
    }
  };

  // Render ONLY the single active card
  const renderActiveCard = () => {
    const secId = currentSection.id;

    if (secId === 'home') {
      return (
        <div className="deck-card-wrapper">
          <Hero teams={state.teams} matches={state.matches} players={state.players} />
        </div>
      );
    }

    if (viewMode === 'admin') {
      switch (secId) {
        case 'teams':
          return (
            <div className="deck-card-wrapper">
              <TeamsPanel teams={state.teams} onAdd={addTeam} onDelete={deleteTeam} />
            </div>
          );
        case 'matches':
          return (
            <div className="deck-card-wrapper">
              <MatchesPanel
                matches={state.matches}
                teams={state.teams}
                onAddOrUpdate={addOrUpdateMatch}
                onDelete={deleteMatch}
              />
            </div>
          );
        case 'players':
          return (
            <div className="deck-card-wrapper">
              <PlayersPanel
                players={state.players}
                teams={state.teams}
                onAdd={addPlayer}
                onDelete={deletePlayer}
              />
            </div>
          );
        case 'player-stats':
          return (
            <div className="deck-card-wrapper">
              <StatsPanel
                playerStats={state.playerStats}
                players={state.players}
                matches={state.matches}
                teams={state.teams}
                onAddOrUpdate={addOrUpdateStat}
                onDelete={deleteStat}
              />
            </div>
          );
        case 'standings':
          return (
            <div className="deck-card-wrapper">
              <StandingsPanel standings={standings} />
            </div>
          );
        default:
          return null;
      }
    } else {
      // Public mode
      switch (secId) {
        case 'matches':
          return (
            <div className="deck-card-wrapper">
              <PublicMatchesView matches={state.matches} teams={state.teams} />
            </div>
          );
        case 'standings':
          return (
            <div className="deck-card-wrapper">
              <StandingsPanel standings={standings} />
            </div>
          );
        case 'players':
          return (
            <div className="deck-card-wrapper">
              <PublicRostersView teams={state.teams} players={state.players} />
            </div>
          );
        case 'player-stats':
          return (
            <div className="deck-card-wrapper">
              <PublicStatsView
                playerStats={state.playerStats}
                players={state.players}
                matches={state.matches}
                teams={state.teams}
              />
            </div>
          );
        default:
          return null;
      }
    }
  };

  return (
    <>
      <Starfield />

      <Navbar
        viewMode={viewMode}
        isAdminLoggedIn={isAdminLoggedIn}
        navItems={sections}
        activeSectionId={currentSection.id}
        onSelectSection={handleSelectSectionById}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onToggleView={handleToggleView}
        onClearAll={handleClearAll}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <SqlViewerModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        sqlContent={getGeneratedSql()}
      />

      {isAdminLoggedIn && (
        <div className="admin-mode-banner">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: sqlSyncStatus === 'saving' ? '#ffaa00' : '#00e676',
                boxShadow: `0 0 8px ${sqlSyncStatus === 'saving' ? '#ffaa00' : '#00e676'}`,
              }}
            />
            Storage: <strong>database.sql</strong> •{' '}
            {sqlSyncStatus === 'saving' ? 'Writing changes...' : 'Synced to disk'}
          </span>
          <div className="admin-banner-actions">
            <button className="admin-banner-btn" onClick={() => setIsSqlModalOpen(true)}>
              💾 View / Download SQL
            </button>
            <button className="admin-banner-btn" onClick={handleToggleView}>
              {viewMode === 'admin' ? '👁️ Preview Public View' : '🛠️ Back to Admin Controls'}
            </button>
            <button
              className="admin-banner-btn"
              onClick={handleLogout}
              style={{ borderColor: 'rgba(255,100,100,0.3)', color: '#ffaaaa' }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Single-Card Viewport */}
      <main
        className={`deck-viewport ${isAdminLoggedIn ? 'deck-viewport--admin' : ''}`}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${currentSection.id}`}
            className="deck-active-slide"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -18 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {renderActiveCard()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
