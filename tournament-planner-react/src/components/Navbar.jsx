import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

export default function Navbar({
  viewMode,
  isAdminLoggedIn,
  navItems,
  activeSectionId,
  onSelectSection,
  onOpenLogin,
  onLogout,
  onToggleView,
  onClearAll,
  onOpenSqlModal,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id) => {
    onSelectSection(id);
    setMobileOpen(false);
  };

  return (
    <motion.nav
      className={`navbar navbar--scrolled ${viewMode === 'admin' ? 'navbar--admin' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="navbar__inner">
        <motion.div
          className="navbar__brand"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavClick(navItems[0]?.id || 'home')}
        >
          <span className="navbar__logo">◆</span>
          <span className="navbar__title">Tournament Planner</span>
          <span className={`navbar__mode-badge ${viewMode}`}>
            {viewMode === 'admin' ? 'ADMIN' : 'PUBLIC'}
          </span>
        </motion.div>

        <div className="navbar__links">
          {navItems.map((item) => {
            const isActive = activeSectionId === item.id;
            return (
              <motion.button
                key={item.id}
                className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    className="navbar__indicator"
                    layoutId="navIndicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="navbar__actions">
          {isAdminLoggedIn ? (
            <>
              <button
                className="navbar__view-toggle"
                onClick={onOpenSqlModal}
                title="View and download live database.sql"
              >
                💾 database.sql
              </button>

              <button
                className="navbar__view-toggle"
                onClick={onToggleView}
                title="Switch between Admin and Public view"
              >
                {viewMode === 'admin' ? '👁️ Public View' : '🛠️ Admin View'}
              </button>

              {viewMode === 'admin' && (
                <motion.button
                  className="navbar__clear"
                  onClick={onClearAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear data
                </motion.button>
              )}

              <button
                className="navbar__logout-btn"
                onClick={onLogout}
                title="Log out of admin"
              >
                Logout
              </button>
            </>
          ) : (
            <motion.button
              className="navbar__login-btn"
              onClick={onOpenLogin}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="login-icon">🔒</span> Admin Login
            </motion.button>
          )}
        </div>

        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <motion.span animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }} />
          <motion.span animate={{ opacity: mobileOpen ? 0 : 1, x: mobileOpen ? -20 : 0 }} />
          <motion.span animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-view-status">
              Mode: <strong>{viewMode.toUpperCase()}</strong> • Storage: <strong>database.sql</strong>
            </div>

            {navItems.map((item, i) => (
              <motion.button
                key={item.id}
                className={`navbar__mobile-link ${activeSectionId === item.id ? 'navbar__mobile-link--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                {item.label}
              </motion.button>
            ))}

            <div className="navbar__mobile-actions">
              {isAdminLoggedIn ? (
                <>
                  <button
                    className="navbar__mobile-link"
                    onClick={() => { onOpenSqlModal(); setMobileOpen(false); }}
                  >
                    💾 View database.sql File
                  </button>
                  <button
                    className="navbar__mobile-link"
                    onClick={() => { onToggleView(); setMobileOpen(false); }}
                  >
                    {viewMode === 'admin' ? 'Switch to Public View' : 'Switch to Admin View'}
                  </button>
                  {viewMode === 'admin' && (
                    <button
                      className="navbar__mobile-link navbar__mobile-link--clear"
                      onClick={() => { onClearAll(); setMobileOpen(false); }}
                    >
                      Clear all data
                    </button>
                  )}
                  <button
                    className="navbar__mobile-link"
                    style={{ color: '#ff9999' }}
                    onClick={() => { onLogout(); setMobileOpen(false); }}
                  >
                    Logout Admin
                  </button>
                </>
              ) : (
                <button
                  className="navbar__mobile-link navbar__mobile-link--login"
                  onClick={() => { onOpenLogin(); setMobileOpen(false); }}
                >
                  🔒 Admin Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
