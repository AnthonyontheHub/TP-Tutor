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

  // NEW: Shuffles every word to a random mastery level
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
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) onClose();
        }}
        style={{ 
          position: 'fixed', 
          top: 'auto', bottom: 0, left: 0, right: 0,
          height: '66vh', 
          width: '100%', maxWidth: '100vw', margin: 0, boxSizing: 'border-box',
          zIndex: 1000, 
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(180, 180, 180, 0.15)',
          borderTop: '1px solid #444',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          background: '#111'
        }}
      >
        <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', touchAction: 'none', flexShrink: 0 }}>
          <div style={{ width: '48px', height: '6px', backgroundColor: '#666', borderRadius: '10px', margin: '0 auto' }} />
        </div>

        <div style={{ padding: '0 20px', overflowY: 'auto', overflowX: 'hidden', flex: 1, width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: 'white' }}>⚙️ SETTINGS</h2>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', color: 'white' }}>Sandbox Mode (Offline)</strong>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Use local dictionary, no AI.</span>
              </div>
              <input type="checkbox" checked={isSandboxMode} onChange={(e) => setIsSandboxMode(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #333' }}>
            <strong style={{ display: 'block', color: 'white', marginBottom: '8px' }}>Gemini API Key</strong>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste API Key here..." style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#000', color: '#fff', marginBottom: '8px', boxSizing: 'border-box' }} />
            <button onClick={handleSaveKey} style={{ background: '#333', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>SAVE KEY</button>
          </div>

          {/* UPDATED DEVELOPER TOOLS SECTION */}
          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #422' }}>
            <strong style={{ display: 'block', color: '#ff4444', marginBottom: '12px' }}>Developer Tools</strong>
            
            <button onClick={handleMasterAll} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              ⚡ INSTANTLY MASTER ALL
            </button>

            <button onClick={handleRandomizeAll} style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              🎲 RANDOMIZE PROGRESS
            </button>

            <button onClick={handleResetAll} style={{ width: '100%', background: '#ff4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⚠️ RESET ALL PROGRESS
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #333', background: '#111', flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            ✕ CLOSE SETTINGS
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
