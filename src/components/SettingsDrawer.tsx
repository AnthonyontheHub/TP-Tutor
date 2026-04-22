import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const { vocabulary, updateVocabStatus, resetProgress } = useMasteryStore(); // Added resetProgress
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('TP_GEMINI_KEY', apiKey);
    alert('API Key Saved!');
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
        resetProgress();
        alert("Progress reset.");
        onClose();
    }
  }

  return (
    <AnimatePresence>
      {/* Separate Backdrop */}
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="drawer-backdrop"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000 }}
      />
      
      {/* Content Drawer */}
      <motion.div
        key="content"
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()} // Stops click-through to backdrop
        className="settings-drawer"
        style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          height: '70vh', background: '#111', zIndex: 2001,
          borderTop: '2px solid #333', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          padding: '20px', overflowY: 'auto', boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '40px', height: '4px', background: '#333', borderRadius: '2px', margin: '0 auto 20px' }} />
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

        {/* Danger Zone */}
        <div className="settings-section" style={{ background: '#2a0a0a', padding: '15px', borderRadius: '12px', border: '1px solid #ff4444' }}>
            <h3 style={{ color: '#ff4444', margin: '0 0 10px 0', fontSize: '1rem' }}>DANGER ZONE</h3>
            <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '15px' }}>This will permanently delete all your learning progress and saved phrases.</p>
            <button onClick={handleReset} style={{ width: '100%', padding: '12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                RESET ALL PROGRESS
            </button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
