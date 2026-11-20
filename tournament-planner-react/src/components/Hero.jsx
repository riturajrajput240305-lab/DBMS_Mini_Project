import { motion } from 'framer-motion';
import Summary from './Summary';
import './Hero.css';

export default function Hero({ teams, matches, players }) {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <motion.p
          className="hero__eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          DBMS MINI PROJECT
        </motion.p>
        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Tournament
          <br />
          <span className="hero__title--outline">planner</span>
        </motion.h1>
        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Manage teams, player rosters and match results.
        </motion.p>

        <motion.div
          className="hero__summary"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <Summary teams={teams} matches={matches} players={players} />
        </motion.div>

        {/* Decorative floating orbs */}
        <motion.div
          className="hero__orb hero__orb--1"
          animate={{
            y: [0, -20, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero__orb hero__orb--2"
          animate={{
            y: [0, 15, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>
    </section>
  );
}
