/* src/components/SettingsDrawer.tsx */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function SettingsDrawer({ isOpen = true, onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const { resetProgress, randomizeProgress, masterAll } = useMasteryStore();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('TP_GEMINI_KEY', apiKey);
    alert('API Key Saved!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to completely reset your progress? This cannot be undone.')) {
      resetProgress();
      alert('Progress has been reset.');
    }
  };

  const handleRandomize = () => {
    if (window.confirm('Randomize all knowledge base statuses? This is for testing only!')) {
      randomizeProgress();
      alert('Knowledge base randomized.');
    }
  };

  const handleMasterAll = () => {
    if (window.confirm('Mark all words and concepts as Mastered?')) {
      masterAll();
      alert('You are now a Toki Pona master!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="backdrop"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="drawer-backdrop"
        />
      )}
      
      {isOpen && (
        <motion.div
          key="content"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()} 
          className="settings-drawer"
          style={{ padding: '20px', overflowY: 'auto', boxSizing: 'border-box' }}
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

          <div className="settings-section" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.8rem' }}>GEMINI API KEY</p>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '6px', marginBottom: '10px' }}
            />
            <button onClick={handleSaveKey} className="btn-review" style={{ width: '100%', margin: 0 }}>SAVE KEY</button>
          </div>

          {/* DANGERZONE */}
          <div className="settings-section dangerzone" style={{ background: '#2a0a0a', padding: '15px', borderRadius: '12px', border: '1px solid #ff4444' }}>
            <h3 style={{ color: '#ff4444', margin: '0 0 10px 0', fontSize: '1rem', textTransform: 'uppercase' }}>Dangerzone</h3>
            
            <button 
              onClick={handleRandomize} 
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #ffaa00', color: '#ffaa00', borderRadius: '6px', marginBottom: '10px', cursor: 'pointer' }}
            >
              Randomize Progress (Test)
            </button>

            <button 
              onClick={handleMasterAll} 
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #00cc66', color: '#00cc66', borderRadius: '6px', marginBottom: '10px', cursor: 'pointer' }}
            >
              Master All Data
            </button>

            <button 
              onClick={handleReset} 
              style={{ width: '100%', padding: '10px', background: '#ff4444', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Reset All Progress
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
