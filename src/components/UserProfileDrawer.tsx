/* src/components/UserProfileDrawer.tsx */
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
      <div style={{ position: 'fixed', inset: 0, zIndex: 3000 }}>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="drawer-backdrop"
        />
        <motion.div 
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
          className="profile-drawer"
          style={{ height: '66vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drawer__handle" onClick={onClose} style={{ cursor: 'pointer' }} />
          
          <div className="drawer__scroll-area">
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ 
                width: '70px', height: '70px', background: '#3b82f6', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '2rem', margin: '0 auto 16px auto', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' 
              }}>
                👤
              </div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', textTransform: 'uppercase' }}>{studentName}</h2>
              <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px', letterSpacing: '0.1em' }}>TOKI PONA LEARNER</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b', border: '1px solid #333', borderLeftWidth: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '4px', fontWeight: 'bold' }}>CURRENT STREAK</div>
                <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>🔥 {currentStreak} Days</div>
              </div>

              <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981', border: '1px solid #333', borderLeftWidth: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '4px', fontWeight: 'bold' }}>VOCABULARY PROGRESS</div>
                <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>{totalLearned} <span style={{ fontSize: '0.9rem', color: '#666' }}>/ 124 Words</span></div>
              </div>

              <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6', border: '1px solid #333', borderLeftWidth: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '4px', fontWeight: 'bold' }}>SAVED PHRASES</div>
                <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>{savedPhrases.length} <span style={{ fontSize: '0.9rem', color: '#666' }}>Items</span></div>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              style={{ 
                width: '100%', marginTop: '24px', background: 'transparent', color: '#666', 
                border: '1px solid #333', padding: '12px', borderRadius: '8px', fontWeight: 'bold'
              }}
            >
              ✕ CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
