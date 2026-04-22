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
  const { resetProgress, masterAllWords, generateRandomProgress } = useMasteryStore();

  useEffect(() => {
    setApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
  }, []);

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
          <h2 style={{ marginBottom: '24px' }}>SETTINGS</h2>
          
          <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>Sandbox Mode</span>
              <input type="checkbox" checked={isSandboxMode} onChange={(e) => setIsSandboxMode(e.target.checked)} />
            </label>
          </div>

          <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
            <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px' }}>GEMINI API KEY</p>
            <input 
              type="password" value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={() => localStorage.setItem('TP_GEMINI_KEY', apiKey)}
              style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
            />
          </div>

          <div style={{ border: '2px dashed #442222', padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ color: '#ff4444', fontSize: '0.8rem', marginBottom: '12px' }}>DANGER ZONE: SYSTEM OVERRIDE</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <button onClick={() => { if(confirm("Master everything?")) masterAllWords(); }} style={{ padding: '10px', background: '#222', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>MASTER ALL WORDS</button>
              <button onClick={() => { if(confirm("Generate random?")) generateRandomProgress(); }} style={{ padding: '10px', background: '#222', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>RANDOMIZE PROGRESS</button>
              <button onClick={() => { if(confirm("Wipe everything?")) resetProgress(); }} style={{ padding: '10px', background: '#222', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>RESET ALL DATA</button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
