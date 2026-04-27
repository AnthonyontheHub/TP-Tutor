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
      style={{ overflowY: 'auto', background: 'rgba(5,5,5,0.98)' }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(10px)' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>SYSTEM PROTOCOLS</h2>
        <button onClick={onClose} className="btn-close-glowing">✕</button>
      </header>

      <div className="side-panel-content" style={{ color: '#ccc', lineHeight: '1.6', paddingBottom: '60px' }}>
        
        {/* SECTION 1: MASTERING THE INTERFACE */}
        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>NEURAL NAVIGATION</h3>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '16px', color: '#eee' }}>Welcome to your Toki Pona immersion interface. The app is divided into three primary sectors:</p>
            <ul style={{ paddingLeft: '16px', listStyleType: 'square', fontSize: '0.8rem' }}>
              <li style={{ marginBottom: '12px' }}><strong>VOCAB:</strong> Your personal Mastery Map. Monitor word recall reliability and core definitions. Words with a <span style={{ color: 'var(--gold)', textShadow: '0 0 5px var(--gold)' }}>glowing shadow</span> contain personal notes or calibrations.</li>
              <li style={{ marginBottom: '12px' }}><strong>ROADMAP:</strong> A structured curriculum path. Advance through stages to unlock deeper linguistic structures. Click the "active" node to start your next lesson.</li>
              <li style={{ marginBottom: '12px' }}><strong>THE ARCHIVE:</strong> Your library of saved phrases, everyday expressions, and the Discography (lyric analysis).</li>
            </ul>
          </div>
        </section>

        {/* SECTION 2: THE VIBE SYSTEM */}
        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>REVIEW VIBES</h3>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>Toggle your "Review Vibe" to adjust jan Lina's focus:</p>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', borderLeft: '3px solid #666' }}>
                <span style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '0.7rem' }}>CHILL:</span> Focuses on reviewing mastered words or "My Saves."
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', borderLeft: '3px solid #666' }}>
                <span style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '0.7rem' }}>DEEP:</span> Introduces new concepts and everyday archive idioms.
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', borderLeft: '3px solid #666' }}>
                <span style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '0.7rem' }}>INTENSE:</span> High-stakes testing or Discography lyric deep-dives.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: JAN LINA & PERSISTENCE */}
        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>JAN LINA LINK</h3>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <p style={{ fontSize: '0.8rem', marginBottom: '12px' }}>jan Lina is your AI tutor. She monitors your neural synchronization in real-time.</p>
            <ul style={{ paddingLeft: '16px', listStyleType: 'disc', fontSize: '0.75rem', color: '#aaa' }}>
              <li style={{ marginBottom: '8px' }}>Chat sessions <span style={{ color: '#fff' }}>persist</span> throughout your session. You can minimize them to navigate the app and expand them later without losing history.</li>
              <li style={{ marginBottom: '8px' }}>Ending a session via "✕" allows Lina to perform a final calibration and update your Mastery Map.</li>
              <li style={{ marginBottom: '8px' }}>Select multiple words in the VOCAB grid to build sentences. You can translate, practice, or save these phrases for later.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4: MASTERY TIERS */}
        <section style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>MASTERY TIERS</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {[
              { status: 'Introduced', color: '#a855f7', desc: 'Initial concept synchronization.' },
              { status: 'Practicing', color: '#3b82f6', desc: 'Neural pathways forming.' },
              { status: 'Confident', color: '#eab308', desc: 'High recall reliability.' },
              { status: 'Mastered', color: '#22c55e', desc: 'Permanent integration achieved.' }
            ].map((item, i) => (
              <div key={i} className="glass-panel" style={{ borderLeft: `3px solid ${item.color}`, padding: '12px 15px' }}>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: '0.75rem', marginBottom: '2px' }}>{item.status.toUpperCase()}</div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: Q&A */}
        <section style={{ marginBottom: '40px' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>Q&A / TROUBLESHOOTING</h3>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 900, fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>Q: Why isn't jan Lina responding?</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>A: Ensure you have a valid Gemini API Key in Settings, or that you are in Sandbox Mode.</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 900, fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>Q: How do I master a word?</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>A: Practice with Lina! As she detects your accuracy, she will propose status upgrades. You can also manually "harden" words in the Word Detail drawer.</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 900, fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>Q: Where did my chat history go?</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>A: History is saved locally while the app is open. If you close the tab or logout, sessions are purged to maintain data security unless previously calibrated.</div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.75rem', color: '#fff', marginBottom: '4px' }}>Q: What is the "Logbook"?</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>A: The Teacher's Logbook (in Settings) stores automated notes Lina has taken about your specific struggles and progress.</div>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
