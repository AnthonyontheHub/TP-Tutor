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

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('TP_GEMINI_KEY', apiKey);
    alert('API Key Saved!');
  };

  const handleResetProgress = () => {
    if (confirm("DANGER: This will wipe all progress and local data. This cannot be undone. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose}
        className="drawer-backdrop"
      />
      
      <motion.div
        key="content"
        initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => { if (info.offset.y > 150) onClose(); }}
        onClick={(e) => e.stopPropagation()} 
        className="settings-drawer"
      >
        <div className="drawer__handle" onClick={onClose} />
        <h2 style={{ color: 'white', marginTop: 0, paddingLeft: '20px' }}>SETTINGS</h2>

        <div className="drawer__scroll-area">
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

          <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '30px' }}>
            <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.8rem' }}>GEMINI API KEY</p>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '6px', marginBottom: '10px' }}
            />
            <button onClick={handleSaveKey} className="btn-review" style={{ width: '100%', margin: 0 }}>SAVE KEY</button>
          </div>

          <div className="settings-section" style={{ background: '#2a0a0a', border: '1px solid #ff4444', padding: '15px', borderRadius: '12px' }}>
            <h3 style={{ color: '#ff4444', margin: '0 0 5px 0', fontSize: '0.9rem' }}>DANGER ZONE</h3>
            <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '15px' }}>This will permanently delete all your learning data.</p>
            <button onClick={handleResetProgress} style={{ width: '100%', padding: '12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>RESET ALL PROGRESS</button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
