/* src/components/SettingsDrawer.tsx */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const { vocabulary } = useMasteryStore();
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
      <div style={{ position: 'relative', zIndex: 3000 }}>
        {/* Unified Backdrop using global CSS */}
        <motion.div 
          key="backdrop"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="drawer-backdrop"
          style={{ cursor: 'pointer' }}
        />
        
        {/* Content Drawer using global CSS structure */}
        <motion.div
          key="content"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="settings-drawer"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            background: '#111',
            borderTop: '3px solid #fff' // Matches index.css variable --text
          }}
        >
          <div className="drawer__handle" />
          
          <div className="drawer__scroll-area">
            <h2 style={{ color: 'white', marginTop: 0, letterSpacing: '0.1em' }}>SETTINGS</h2>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #333' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Sandbox Mode (Offline)</span>
                <input 
                  type="checkbox" 
                  checked={isSandboxMode} 
                  onChange={(e) => setIsSandboxMode(e.target.checked)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                />
              </label>
              <p style={{ color: '#666', fontSize: '0.7rem', marginTop: '8px' }}>Disables AI features and uses local data only.</p>
            </div>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
              <p style={{ color: '#3b82f6', margin: '0 0 10px 0', fontSize: '0.7rem', fontWeight: 'bold' }}>GEMINI API KEY</p>
              <input 
                type="password" 
                value={apiKey} 
                placeholder="Paste key here..."
                onChange={(e) => setApiKey(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#000', 
                  border: '1px solid #444', 
                  color: 'white', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              <button onClick={handleSaveKey} className="btn-review" style={{ margin: 0 }}>
                SAVE KEY
              </button>
            </div>
            
            <button 
              onClick={onClose} 
              style={{ 
                width: '100%', 
                marginTop: '30px', 
                background: 'transparent', 
                color: '#666', 
                border: '1px solid #333', 
                padding: '12px', 
                borderRadius: '8px', 
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✕ CLOSE SETTINGS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
