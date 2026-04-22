/* src/components/UserProfileDrawer.tsx */
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
          <motion.div key="backdrop" className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div key="drawer" className="profile-drawer" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ padding: '24px' }}>
            <div className="drawer__handle" />
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100px', height: '100px', background: '#3b82f6', borderRadius: '50%', margin: '0 auto 16px', cursor: 'pointer', overflow: 'hidden', border: '3px solid #fff' }}
              >
                {profileImage ? <img src={profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
              <h2 style={{ color: 'white' }}>{studentName}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>🔥 {currentStreak} Day Streak</div>
              <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>📚 {totalLearned} / 124 Words</div>
              <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>✍️ {savedPhrases.length} Saved Phrases</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
