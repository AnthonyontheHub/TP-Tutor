import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
}

export default function UserProfileDrawer({ onClose }: Props) {
  const { studentName, currentStreak, savedPhrases, getStatusSummary } = useMasteryStore();
  
  const summary = getStatusSummary();
  const totalLearned = summary.introduced + summary.practicing + summary.confident + summary.mastered;

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
          drag="y"
          dragConstraints={{ top: 0 }}
          onDragEnd={(_, info) => { if (info.offset.y > 150) onClose(); }}
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '75vh', background: '#111', zIndex: 2000, borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', flexShrink: 0, display: 'flex', justifyContent: 'center' }} onClick={onClose}>
            <div style={{ width: '48px', height: '6px', background: '#444', borderRadius: '3px' }} />
          </div>
          
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px auto', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              👤
            </div>
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
        </motion.div>
      </>
    </AnimatePresence>
  );
}
