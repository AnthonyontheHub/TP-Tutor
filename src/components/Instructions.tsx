/* src/components/Instructions.tsx */
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Instructions({ onClose }: Props) {
  return (
    <motion.div
      className="full-screen-view"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="view-header">
        <button onClick={onClose} className="btn-back">
          <span>←</span> BACK
        </button>
        <h2 style={{ marginLeft: '16px', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em' }}>INSTRUCTIONS</h2>
      </header>

      <div className="view-content" style={{ color: '#ccc', lineHeight: '1.6' }}>
        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title">Getting Started</h3>
          <div className="glass-panel">
            <p style={{ marginBottom: '12px' }}>Welcome to TP-Tutor! Here's how to master Toki Pona with jan Lina:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'square' }}>
              <li style={{ marginBottom: '8px' }}>Chat with jan Lina by clicking the 💬 icon.</li>
              <li style={{ marginBottom: '8px' }}>As you chat, jan Lina will observe your knowledge and propose mastery level updates.</li>
              <li style={{ marginBottom: '8px' }}>Use the Daily Review button to practice specific words based on your current level.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title">Mastery Levels</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {[
              { status: 'Introduced', color: 'var(--blue)', desc: 'The word is new to you (0-50 pts).' },
              { status: 'Practicing', color: 'var(--amber)', desc: 'You\'re using it, but it\'s not fluid yet (51-150 pts).' },
              { status: 'Confident', color: '#16a34a', desc: 'You know it well in most contexts (151-400 pts).' },
              { status: 'Mastered', color: 'var(--cyan)', desc: 'The word is now part of your "mental map" (400+ pts).' }
            ].map((m, i) => (
              <div key={i} className="glass-panel" style={{ borderLeft: `4px solid ${m.color}`, padding: '12px 20px' }}>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }}>{m.status.toUpperCase()}</div>
                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 className="section-title">Lore & Persona</h3>
          <div className="glass-panel">
            <p>jan Lina is more than just a tutor. She uses your personal <strong>Lore</strong> (Work, Hobbies, etc.) to make conversations relevant to you. Fill out your profile to get the most out of your sessions!</p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
