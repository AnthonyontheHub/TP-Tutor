import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Instructions({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 3000 }}
        />
      )}
      {isOpen && (
        <motion.div
          key="drawer"
          className="settings-drawer"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ padding: '24px', zIndex: 3001 }}
        >
          <div className="drawer__handle" />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.05em' }}>nasin pi jan Lina</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <section>
              <h3 className="section-title" style={{ marginBottom: '10px' }}>Interaction Guide</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>👆 Single Tap</div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>Add word to the sentence builder. If builder is empty, opens word details.</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>✌️ Double Tap</div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>Quickly cycle through mastery levels (Dev Mode).</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>🖐️ Long Press</div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>Force add word to builder (even if builder was empty).</div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="section-title" style={{ marginBottom: '10px' }}>Mastery Levels</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #1d4ed8' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>🔵 Introduced (0-50 pts)</div>
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>The word is new to you. jan Lina will show it to you often.</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #92400e' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>🟡 Practicing (51-150 pts)</div>
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>You're using it, but it's not fluid yet. Keep at it!</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>🟢 Confident (151-400 pts)</div>
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>You know it well in most contexts. Nearly there.</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #22c55e' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>✅ Mastered (400+ pts)</div>
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>The word is now part of your "mental map." Automatic recall!</div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="section-title" style={{ marginBottom: '10px' }}>jan Lina's Lore</h3>
              <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', fontSize: '0.85rem', color: '#ccc', lineHeight: '1.5' }}>
                Go to your Profile and use the <b>Lore Builder</b> to tell jan Lina about your Work, Hobbies, and Pets. 
                She uses this "Lore" to create custom sentences that actually matter to you.
              </div>
            </section>
          </div>

          <button 
            onClick={onClose}
            className="btn-review"
            style={{ marginTop: '32px' }}
          >
            PONA!
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
