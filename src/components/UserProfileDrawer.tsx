import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
}

export default function UserProfileDrawer({ onClose }: Props) {
  const { studentName, setStudentName, currentStreak, savedPhrases, getStatusSummary } = useMasteryStore();
  const [nameInput, setNameInput] = useState(studentName === 'Student' ? '' : studentName);
  
  const summary = getStatusSummary();
  // Calculate how many words are no longer "not_started"
  const totalLearned = summary.introduced + summary.practicing + summary.confident + summary.mastered;

  const handleSave = () => {
    if (nameInput.trim()) {
      setStudentName(nameInput.trim());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} 
          onClick={onClose} 
          style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 1999 }} 
        />
        <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '75vh', background: '#111', zIndex: 2000, borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem' }}>User Profile</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 'bold' }}>DISPLAY NAME</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                value={nameInput} 
                onChange={e => setNameInput(e.target.value)} 
                placeholder="Enter your name..."
                style={{ flex: 1, padding: '12px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none' }} 
              />
              <button onClick={handleSave} style={{ padding: '0 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                SAVE
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Current Streak</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>🔥 {currentStreak} Days</div>
            </div>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Vocabulary Progress</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>{totalLearned} <span style={{ fontSize: '1rem', color: '#888' }}>/ 124 Words</span></div>
            </div>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Saved Phrases</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>{savedPhrases.length} <span style={{ fontSize: '1rem', color: '#888' }}>Phrases</span></div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
