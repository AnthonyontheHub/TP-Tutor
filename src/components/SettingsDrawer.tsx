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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="settings-drawer"
      >
        <div className="drawer__handle" />
        
        <div className="drawer__scroll-area">
          <h2 style={{ color: 'white', marginTop: 0, letterSpacing: '0.1em' }}>SETTINGS</h2>

          <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #333' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontWeight: 'bold' }}>Sandbox Mode (Offline)</span>
              <input 
                type="checkbox" 
                checked={isSandboxMode} 
                onChange={(e) => setIsSandboxMode(e.target.checked)}
                style={{ width: '22px', height: '22px', cursor: 'pointer' }}
              />
            </label>
            <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '8px' }}>Disables AI features and uses local data only.</p>
          </div>

          <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
            <p style={{ color: '#3b82f6', margin: '0 0 10px 0', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>Gemini API Configuration</p>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API Key..."
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#000', 
                border: '1px solid #333', 
                color: 'white', 
                borderRadius: '8px', 
                marginBottom: '12px',
                fontFamily: 'inherit'
              }}
            />
            <button onClick={handleSaveKey} className="btn-review" style={{ width: '100%', margin: 0 }}>SAVE API KEY</button>
          </div>
          
          <button 
            onClick={onClose}
            style={{ 
              width: '100%', 
              marginTop: '24px', 
              padding: '12px', 
              background: 'transparent', 
              color: '#666', 
              border: '1px solid #333', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
