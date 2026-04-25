/* src/components/SettingsPanel.tsx */
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsPanel({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const { resetProfileAndRunSetup, resetAsNewUser, randomizeVocab, masterAllVocab } = useMasteryStore();

  const handleResetSetup = () => {
    if (confirm("Clear profile/lore and restart onboarding? Vocabulary progress is preserved. Continue?")) {
      resetProfileAndRunSetup();
      onClose();
    }
  };

  return (
    <motion.div
      className="side-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>SYSTEM CONFIG</h2>
        <button onClick={onClose} className="btn-close-glowing">✕</button>
      </header>

      <div className="side-panel-content">
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Session Protocol</h3>
          
          <div className="settings-row" onClick={() => setIsSandboxMode(!isSandboxMode)}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Sandbox Mode</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Local execution only (No API)</div>
            </div>
            <input type="checkbox" checked={isSandboxMode} onChange={() => {}} className="settings-checkbox" />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label className="section-title" style={{ fontSize: '0.55rem' }}>Neural Key (Gemini API)</label>
            <input 
              type="password" 
              placeholder="Paste encrypted key..."
              className="settings-input"
              style={{ fontSize: '0.8rem', padding: '10px' }}
              value={localStorage.getItem('TP_GEMINI_KEY') || ''}
              onChange={(e) => localStorage.setItem('TP_GEMINI_KEY', e.target.value)}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Onboarding</h3>
          <button onClick={handleResetSetup} className="btn-settings" style={{ fontSize: '0.75rem', padding: '10px' }}>
            RE-INITIALIZE SETUP
          </button>
        </div>

        <div className="danger-zone" style={{ borderColor: 'rgba(239, 68, 68, 0.1)' }}>
          <h3 className="section-title" style={{ color: '#ef4444', fontSize: '0.6rem' }}>Terminal Command (Wipe)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => {
                if (confirm("EXTREME DANGER: Permanent wipe of all progress. Proceed?")) {
                  resetAsNewUser();
                  onClose();
                }
              }}
              className="btn-danger"
              style={{ padding: '10px', fontSize: '0.7rem' }}
            >
              FULL DATA PURGE
            </button>
            <button onClick={() => randomizeVocab()} className="btn-danger" style={{ padding: '10px', fontSize: '0.7rem', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.1)' }}>
              RANDOMIZE NEURAL MAP
            </button>
            <button onClick={() => masterAllVocab()} className="btn-danger" style={{ padding: '10px', fontSize: '0.7rem', color: 'var(--gold)', borderColor: 'rgba(255, 191, 0, 0.1)' }}>
              FORCE FULL MASTERY
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
