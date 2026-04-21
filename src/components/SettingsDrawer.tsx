import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

const STATUS_ORDER: MasteryStatus[] = [
  'not_started', 'introduced', 'practicing', 'confident', 'mastered',
];

export default function SettingsDrawer({ onClose, isSandboxMode, setIsSandboxMode }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

  function handleSaveKey() {
    localStorage.setItem('TP_GEMINI_KEY', apiKey);
    alert('API Key Saved!');
  }

  function handleMasterAll() {
    if (confirm("Instantly master all words for testing?")) {
      vocabulary.forEach(word => updateVocabStatus(word.id, 'mastered'));
      onClose();
    }
  }

  function handleRandomizeAll() {
    if (confirm("Randomly shuffle the levels of all words?")) {
      vocabulary.forEach(word => {
        const randomIndex = Math.floor(Math.random() * STATUS_ORDER.length);
        updateVocabStatus(word.id, STATUS_ORDER[randomIndex]);
      });
      onClose();
    }
  }

  function handleResetAll() {
    if (confirm("DANGER: Reset all progress back to Not Started?")) {
      vocabulary.forEach(word => updateVocabStatus(word.id, 'not_started'));
      onClose();
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="drawer-backdrop" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999 }}
      />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onDragEnd={(_, info) => {
          // Only close if dragged significantly down
          if (info.offset.y > 200 || info.velocity.y > 600) onClose();
        }}
        onClick={(e) => e.stopPropagation()} // CRITICAL: Prevents clicks inside from closing the drawer
        style={{ 
          position: 'fixed', 
          bottom: 0, left: 0, right: 0,
          height: '75vh', 
          width: '100%', maxWidth: '100vw', margin: 0, boxSizing: 'border-box',
          zIndex: 1000, 
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.5)',
          borderTop: '1px solid #333',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          background: '#111',
          overflow: 'hidden'
        }}
      >
        <div style={{ width: '100%', padding: '20px 0', cursor: 'grab', touchAction: 'none', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '4px', backgroundColor: '#444', borderRadius: '10px', margin: '0 auto' }} />
        </div>

        <div style={{ padding: '0 20px 40px 20px', overflowY: 'auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: 'white', fontWeight: 800 }}>SETTINGS</h2>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', color: 'white' }}>Sandbox Mode (Offline)</strong>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Use local dictionary, no AI.</span>
              </div>
              <input type="checkbox" checked={isSandboxMode} onChange={(e) => setIsSandboxMode(e.target.checked)} style={{ width: '24px', height: '24px' }} />
            </div>
          </div>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #333' }}>
            <strong style={{ display: 'block', color: 'white', marginBottom: '8px' }}>Gemini API Key</strong>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste Key..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }} />
            <button onClick={handleSaveKey} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>SAVE KEY</button>
          </div>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #422' }}>
            <strong style={{ display: 'block', color: '#ff4444', marginBottom: '12px', fontSize: '0.75rem', letterSpacing: '0.05em' }}>DEVELOPER TOOLS</strong>
            <button onClick={handleMasterAll} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 900, marginBottom: '10px' }}>⚡ MASTER ALL</button>
            <button onClick={handleRandomizeAll} style={{ width: '100%', background: '#333', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, marginBottom: '10px' }}>🎲 RANDOMIZE</button>
            <button onClick={handleResetAll} style={{ width: '100%', background: '#422', color: '#ff4444', border: '1px solid #622', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>⚠️ RESET ALL</button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
