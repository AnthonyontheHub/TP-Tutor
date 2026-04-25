/* src/components/InstructionsPanel.tsx */
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionsPanel({ onClose }: Props) {
  return (
    <motion.div
      className="side-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>SYSTEM PROTOCOLS</h2>
        <button onClick={onClose} className="btn-close-glowing">✕</button>
      </header>


      <div className="side-panel-content" style={{ color: '#ccc', lineHeight: '1.6' }}>
        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Neural Immersion</h3>
          <div className="glass-panel" style={{ padding: '15px' }}>
            <ul style={{ paddingLeft: '16px', listStyleType: 'square', fontSize: '0.8rem' }}>
              <li style={{ marginBottom: '8px' }}>Execute dialogue with jan Lina via the 💬 interface.</li>
              <li style={{ marginBottom: '8px' }}>Lina monitors neural patterns and proposes mastery calibrations.</li>
              <li style={{ marginBottom: '8px' }}>Use 'Daily Review' to reinforce high-frequency linguistic structures.</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Mastery Tiers</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {[
              { status: 'Introduced', color: 'var(--blue)', desc: 'Initial concept synchronization (0-50 pts).' },
              { status: 'Practicing', color: 'var(--amber)', desc: 'Neural pathways forming (51-150 pts).' },
              { status: 'Confident', color: '#16a34a', desc: 'High recall reliability (151-400 pts).' },
              { status: 'Mastered', color: 'var(--gold)', desc: 'Permanent integration achieved (400+ pts).' }
            ].map((m, i) => (
              <div key={i} className="glass-panel" style={{ borderLeft: `3px solid ${m.color}`, padding: '10px 15px' }}>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: '0.75rem', marginBottom: '2px' }}>{m.status.toUpperCase()}</div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Biographical Sync</h3>
          <div className="glass-panel" style={{ padding: '15px' }}>
            <p style={{ fontSize: '0.8rem' }}>Neural Link efficiency increases when <strong>Lore</strong> is provided. Lina adapts drills to your specific operational history.</p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
