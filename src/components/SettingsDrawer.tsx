/* src/components/SettingsDrawer.tsx */
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const { resetProfileAndRunSetup } = useMasteryStore();

  const handleResetSetup = () => {
    if (confirm("This will clear your Profile and Lore and restart the onboarding. Your vocabulary progress will be saved. Continue?")) {
      resetProfileAndRunSetup();
      onClose();
    }
  };

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
        <h2 style={{ marginLeft: '16px', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em' }}>SETTINGS</h2>
      </header>

      <div className="view-content">
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 className="section-title">Session Preferences</h3>
          
          <div className="settings-row" style={{ marginBottom: '20px' }} onClick={() => setIsSandboxMode(!isSandboxMode)}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sandbox Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disable API calls for testing</div>
            </div>
            <input 
              type="checkbox" 
              checked={isSandboxMode} 
              onChange={() => {}}
              className="settings-checkbox"
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label className="settings-label">Gemini API Key</label>
            <input 
              type="password" 
              placeholder="Paste your key here..."
              className="settings-input"
              value={localStorage.getItem('TP_GEMINI_KEY') || ''}
              onChange={(e) => localStorage.setItem('TP_GEMINI_KEY', e.target.value)}
            />
            <p style={{ fontSize: '0.65rem', color: '#555', marginTop: '6px' }}>
              Your key is stored locally and never sent to our servers.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 className="section-title">Development & Testing</h3>
          <button 
            onClick={handleResetSetup}
            className="btn-settings"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'white' }}
          >
            RESET PROFILE & RUN SETUP
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Use this to re-test the onboarding flow or change your initial student details.
          </p>
        </div>

        <div className="danger-zone">
          <h3 className="section-title" style={{ color: '#ef4444' }}>Danger Zone</h3>
          <button 
            onClick={() => {
              if (confirm("EXTREME DANGER: This will permanently wipe ALL your progress, vocabulary, and cloud data. This cannot be undone. Proceed?")) {
                useMasteryStore.getState().resetAsNewUser();
                onClose();
              }
            }}
            className="btn-danger"
          >
            WIPE ALL DATA & RESET ACCOUNT
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px', color: '#222', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em' }}>
          TP-TUTOR v0.1.0-GLITCH
        </div>
      </div>
    </motion.div>
  );
}
