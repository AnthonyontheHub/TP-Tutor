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

  const handleReset = () => {
    if (confirm('DANGER: This will wipe all Toki Pona mastery progress and saved phrases. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
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
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000 }}
      />
      
      <motion.div
        key="content"
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => { if (info.offset.y > 150) onClose(); }}
        onClick={(e) => e.stopPropagation()} 
        className="settings-drawer"
        style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          height: '70vh', background: '#111', zIndex: 2001,
          borderTop: '2px solid #333', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          padding: '20px', overflowY: 'auto', boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '40px', height: '4px', background: '#333', borderRadius: '2px', margin: '0 auto 20px', cursor: 'grab' }} onClick={onClose} />
        <h2 style={{ color: 'white', marginTop: 0 }}>SETTINGS</h2>

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

        <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
          <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.8rem' }}>GEMINI API KEY</p>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '6px', marginBottom: '10px' }}
          />
          <button onClick={handleSaveKey} className="btn-review" style={{ width: '100%', margin: 0 }}>SAVE KEY</button>
        </div>

        {/* Restored Danger Zone */}
        <div className="settings-section" style={{ background: '#2a0808', border: '1px solid #ef4444', padding: '15px', borderRadius: '12px', marginTop: '30px' }}>
          <p style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>DANGER ZONE</p>
          <button onClick={handleReset} style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            RESET ALL PROGRESS
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
