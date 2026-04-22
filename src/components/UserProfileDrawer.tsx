import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileDrawer({ isOpen, onClose }: Props) {
  const { studentName, currentStreak, savedPhrases, getStatusSummary, profileImage, setProfileImage } = useMasteryStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const summary = getStatusSummary();
  const totalLearned = summary.introduced + summary.practicing + summary.confident + summary.mastered;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            key="backdrop"
            className="drawer-backdrop"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            style={{ zIndex: 2000 }}
          />
          <motion.div 
            key="drawer"
            className="profile-drawer"
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ padding: '24px', zIndex: 2001 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div className="drawer__handle" style={{ margin: '0 auto' }} />
              <button onClick={onClose} style={{ position: 'absolute', right: '24px', background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="drawer__scroll-area">
              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: '#3b82f6', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '3rem', 
                    margin: '0 auto 16px auto', 
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '3px solid #fff'
                  }}
                >
                  {profileImage ? <img src={profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  <div style={{ position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.6)', width: '100%', fontSize: '0.6rem', color: 'white', padding: '2px 0' }}>CHANGE</div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />

                <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>{studentName}</h2>
                <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>Toki Pona Student</div>
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
            </div>
            
            <div style={{ padding: '20px 0' }}>
              <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>✕ CLOSE</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
