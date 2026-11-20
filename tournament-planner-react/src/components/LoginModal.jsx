import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Default credentials: admin / admin123 or admin / admin
      const validUser = username.trim().toLowerCase() === 'admin';
      const validPass = password === 'admin123' || password === 'admin';

      if (validUser && validPass) {
        setIsLoading(false);
        onLoginSuccess();
        setUsername('');
        setPassword('');
        setError('');
      } else {
        setIsLoading(false);
        setError('Invalid credentials. Use admin / admin123');
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="login-modal-overlay">
          <motion.div
            className="login-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="login-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              className="login-modal-close"
              onClick={onClose}
              type="button"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="login-modal-header">
              <div className="login-badge">🔒 ADMIN PORTAL</div>
              <h2>Sign in to Admin</h2>
              <p>Access tournament management controls, fixtures, rosters and scores.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <label className="login-label">
                <span>Username</span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </label>

              <label className="login-label">
                <span>Password</span>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              {error && (
                <motion.div
                  className="login-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="login-actions">
                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Sign In as Admin'}
                </button>
              </div>

              <div className="login-hint">
                <span>Demo Credentials: <strong>admin</strong> / <strong>admin123</strong></span>
                <button
                  type="button"
                  className="login-quickfill-btn"
                  onClick={handleQuickFill}
                >
                  Autofill
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

