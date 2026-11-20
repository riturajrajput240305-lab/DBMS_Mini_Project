import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SqlViewerModal.css';

export default function SqlViewerModal({ isOpen, onClose, sqlContent }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'database.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="sql-modal-overlay">
          <motion.div
            className="sql-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="sql-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="sql-modal-header">
              <div>
                <span className="sql-badge">ORACLE SQL • PERSISTENCE LAYER</span>
                <h2>database.sql File</h2>
                <p>Live synchronized file content containing all tables, constraints, records and DBMS queries.</p>
              </div>
              <button
                className="sql-modal-close"
                onClick={onClose}
                type="button"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="sql-preview-box">
              <pre><code>{sqlContent}</code></pre>
            </div>

            <div className="sql-modal-actions">
              <div className="sql-status-indicator">
                <span className="sql-live-dot" /> Live file connected to disk
              </div>
              <div className="sql-action-btns">
                <button
                  type="button"
                  className="sql-btn-secondary"
                  onClick={handleCopy}
                >
                  {copied ? '✓ Copied to Clipboard' : '📋 Copy SQL'}
                </button>
                <button
                  type="button"
                  className="sql-btn-primary"
                  onClick={handleDownload}
                >
                  ⬇ Download database.sql
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

