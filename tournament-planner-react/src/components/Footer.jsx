import { motion } from 'framer-motion';
import './Footer.css';

export default function Footer() {
  return (
    <motion.footer
      className="site-footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="site-footer__inner">
        <span className="site-footer__brand">◆ TOURNAMENT PLANNER</span>
        <span className="site-footer__note">All data is stored in this browser.</span>
      </div>
    </motion.footer>
  );
}

