/* src/components/LogbookPanel.tsx */
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
}

export default function LogbookPanel({ onClose }: Props) {
  const { vocabulary } = useMasteryStore();
  const logbookEntries = vocabulary.filter(v => v.sessionNotes);

  return (
    <motion.div
      className="side-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        width: '100%',
        maxWidth: '500px',
        height: '100%',
        background: 'var(--surface-opaque)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        borderLeft: '1px solid var(--border)'
      }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>TEACHER'S LOGBOOK</h2>
        <button type="button" onClick={onClose} className="close-button">✕</button>
      </header>

      <div className="side-panel-content" style={{ padding: '24px', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '24px', lineHeight: '1.5' }}>
          This logbook contains private calibration notes recorded by jan Lina based on your performance and interactions.
        </p>

        {logbookEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>📖</span>
            jan Lina has not recorded any private notes yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {logbookEntries.map(v => (
              <div key={v.id} style={{ 
                background: '#1a1a1a', 
                borderRadius: '8px', 
                border: '1px solid #333', 
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'baseline',
                  marginBottom: '8px',
                  borderBottom: '1px solid #222',
                  paddingBottom: '8px'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase' }}>{v.word}</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#666' }}>CALIBRATION NOTE</span>
                </div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#eee', 
                  lineHeight: '1.6',
                  letterSpacing: '0.01em',
                  fontWeight: 400
                }}>
                  {v.sessionNotes}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
