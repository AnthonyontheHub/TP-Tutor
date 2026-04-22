/* src/components/UserProfileDrawer.tsx */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

export default function UserProfileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { studentName, savedPhrases } = useMasteryStore();
  const [photoScale, setPhotoScale] = useState(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="profile-drawer" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ padding: '24px' }}>
            <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', color: '#444' }}>✕</button>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ 
                width: '100px', height: '100px', background: '#3b82f6', borderRadius: '50%', margin: '0 auto', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                transform: `scale(${photoScale})`, transition: 'transform 0.2s ease'
              }}>👤</div>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '0.6rem', color: '#666', display: 'block', marginBottom: '5px' }}>PHOTO ZOOM</label>
                <input type="range" min="0.5" max="1.5" step="0.1" value={photoScale} onChange={(e) => setPhotoScale(parseFloat(e.target.value))} style={{ width: '150px' }} />
              </div>

              <h2 style={{ color: 'white', marginTop: '20px' }}>{studentName}</h2>
              <p style={{ color: '#666' }}>{savedPhrases.length} Phrases Saved</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
