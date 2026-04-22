import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const { vocabulary, updateVocabStatus } = useMasteryStore();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('TP_GEMINI_KEY', apiKey);
    alert('API Key Saved!');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="content"
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="side-drawer"
        style={{ padding: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'white', margin: 0 }}>SETTINGS</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center' }}>
            <span>Sandbox Mode (Offline)</span>
            <input 
              type="checkbox" 
              checked={isSandboxMode} 
              onChange={(e) => setIsSandboxMode(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </label>
        </div>

        <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px' }}>
          <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.8rem' }}>GEMINI API KEY</p>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '6px', marginBottom: '10px' }}
          />
          <button onClick={handleSaveKey} className="btn-review" style={{ width: '100%', margin: 0 }}>SAVE KEY</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
