import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const [apiKey, setApiKey] = useState('');
  const { resetProgress } = useMasteryStore();

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('TP_GEMINI_KEY', apiKey);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="settings-drawer"
        initial={{ y: '100%', x: '-50%' }}
        animate={{ y: 0, x: '-50%' }}
        exit={{ y: '100%', x: '-50%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="drawer__handle" onClick={onClose} />
        <div className="drawer__scroll-area">
          <h2 style={{ marginBottom: '24px', letterSpacing: '0.05em' }}>SETTINGS</h2>
          
          <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontWeight: 'bold' }}>Sandbox Mode (Offline)</span>
              <input type="checkbox" checked={isSandboxMode} onChange={(e) => setIsSandboxMode(e.target.checked)} style={{ width: '20px', height: '20px' }} />
            </label>
          </div>

          <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
            <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px', fontWeight: 'bold' }}>GEMINI API KEY</p>
            <input 
              type="password" value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px', outline: 'none' }}
            />
            <button onClick={handleSave} style={{ width: '100%', marginTop: '16px', padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE KEY</button>
          </div>

          <div style={{ marginTop: 'auto', border: '2px dashed #442222', padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ color: '#ff4444', fontSize: '0.8rem', marginBottom: '8px', letterSpacing: '0.1em' }}>DANGER ZONE: SYSTEM OVERRIDE</h3>
            <p style={{ fontSize: '0.65rem', color: '#666', marginBottom: '12px' }}>This will permanently wipe your local and cloud progress. This action cannot be undone.</p>
            <button 
              onClick={() => { if(confirm("Wipe all progress? This is permanent.")) resetProgress(); }}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}
            >
              RESET ALL PROGRESS
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
