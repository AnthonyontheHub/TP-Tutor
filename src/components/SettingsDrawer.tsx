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
        className="drawer-backdrop" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
      />
      
      <motion.div 
        className="settings-drawer"
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="drawer__handle" />
        <div className="drawer__scroll-area">
          <h2 style={{ fontSize: '2.4rem', marginBottom: '24px', color: 'white' }}>SETTINGS</h2>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer' }}>
              <span>Sandbox Mode (Offline)</span>
              <input 
                type="checkbox" 
                checked={isSandboxMode} 
                onChange={(e) => setIsSandboxMode(e.target.checked)}
                style={{ width: '24px', height: '24px', cursor: 'pointer' }}
              />
            </label>
            <p style={{ marginTop: '8px', color: '#ccc', fontSize: '0.85rem' }}>Use local dictionary instead of AI.</p>
          </div>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
            <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>GEMINI API KEY</p>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste API Key here..."
              style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px', marginBottom: '12px', outline: 'none' }}
            />
            <button onClick={handleSaveKey} className="btn-review" style={{ width: '100%', margin: 0, padding: '12px', borderRadius: '8px' }}>SAVE KEY</button>
          </div>
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>✕ CLOSE SETTINGS</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
