import { motion } from 'framer-motion';
import './Summary.css';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

export default function Summary({ teams, matches, players }) {
  const completed = matches.filter((m) => m.status === 'Completed').length;
  const stats = [
    { label: 'Teams', value: teams.length, icon: '🏆' },
    { label: 'Matches', value: matches.length, icon: '⚔️' },
    { label: 'Completed', value: completed, icon: '✅' },
    { label: 'Players', value: players.length, icon: '👥' },
  ];

  return (
    <motion.section
      className="summary-bar"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((s) => (
        <motion.div key={s.label} className="summary-card" variants={item}>
          <span className="summary-card__icon">{s.icon}</span>
          <motion.strong
            className="summary-card__value"
            key={s.value}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {s.value}
          </motion.strong>
          <span className="summary-card__label">{s.label}</span>
        </motion.div>
      ))}
    </motion.section>
  );
}

