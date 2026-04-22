import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
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
        key="backdrop"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="drawer-backdrop"
      />
      
      <motion.div
        key="content"
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="settings-drawer"
      >
        <div className="drawer__handle" onClick={onClose} />
        <div className="drawer__scroll-area">
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>SETTINGS</h2>

          <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center', cursor: 'pointer' }}>
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
