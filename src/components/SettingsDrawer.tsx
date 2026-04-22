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

  return (
    <AnimatePresence>
      <motion.div 
        className="drawer-backdrop" 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose} 
      />
      <motion.div
        className="settings-drawer"
        initial={{ y: '100%', x: '-50%' }}
        animate={{ y: 0, x: '-50%' }}
        exit={{ y: '100%', x: '-50%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="drawer__handle" onClick={onClose} />
        <div className="drawer__scroll-area">
          <h2 style={{ marginBottom: '20px' }}>SETTINGS</h2>
          <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sandbox Mode</span>
              <input type="checkbox" checked={isSandboxMode} onChange={(e) => setIsSandboxMode(e.target.checked)} />
            </label>
          </div>
          <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px' }}>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '10px' }}>GEMINI API KEY</p>
            <input 
              type="password" value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={() => localStorage.setItem('TP_GEMINI_KEY', apiKey)}
              style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '6px' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
