/* src/components/SettingsDrawer.tsx */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ isOpen, onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const [apiKey, setApiKey] = useState('');
  const { resetAllVocab, clearAllPhrases, setStudentName } = useMasteryStore();

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('TP_GEMINI_KEY', apiKey);
    alert('API Key saved!');
  };

  const handleResetVocab = () => {
    if (window.confirm('Reset ALL vocabulary progress to Not Started? This cannot be undone.')) {
      resetAllVocab();
    }
  };

  const handleClearPhrases = () => {
    if (window.confirm('Delete all saved phrases? This cannot be undone.')) {
      clearAllPhrases();
    }
  };

  const handleResetProfile = () => {
    if (window.confirm('Reset your profile and start over? This will clear your name and streak.')) {
      setStudentName('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="drawer-backdrop"
        />
      )}

      {isOpen && (
        <motion.div
          key="content"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="settings-drawer"
          style={{ padding: '20px', overflowY: 'auto', boxSizing: 'border-box' }}
        >
          <div className="drawer__handle" />
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px', fontSize: '1rem', letterSpacing: '0.1em' }}>SETTINGS</h2>

          {/* Sandbox Mode */}
          <div className="settings-section">
            <label className="settings-row">
              <span className="settings-label">Sandbox Mode (Offline)</span>
              <input
                type="checkbox"
                checked={isSandboxMode}
                onChange={(e) => setIsSandboxMode(e.target.checked)}
                className="settings-checkbox"
              />
            </label>
          </div>

          {/* API Key */}
          <div className="settings-section">
            <p className="settings-label" style={{ marginBottom: '8px' }}>GEMINI API KEY</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="settings-input"
              placeholder="Enter API key..."
            />
            <button onClick={handleSaveKey} className="btn-settings">SAVE KEY</button>
          </div>

          {/* Danger Zone */}
          <div className="danger-zone">
            <p className="settings-label" style={{ color: '#ef4444', marginBottom: '12px' }}>DANGER ZONE</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleResetVocab} className="btn-danger">
                Reset All Vocabulary Progress
              </button>
              <button onClick={handleClearPhrases} className="btn-danger">
                Clear All Saved Phrases
              </button>
              <button onClick={handleResetProfile} className="btn-danger">
                Reset Profile &amp; Start Over
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
