import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileDrawer({ isOpen, onClose }: Props) {
  const studentName = useMasteryStore(s => s.studentName);
  const vocabulary  = useMasteryStore(s => s.vocabulary);
  const concepts    = useMasteryStore(s => s.concepts);
  const dragControls = useDragControls();

  const statusCounts = vocabulary.reduce(
    (acc, w) => { acc[w.status]++; return acc; },
    { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0 } as Record<MasteryStatus, number>
  );
  const totalLearned = statusCounts.introduced + statusCounts.practicing + statusCounts.confident + statusCounts.mastered;
  const masteredConcepts = concepts.filter(c => c.status === 'mastered').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div
          key="drawer"
          className="profile-drawer"
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.3 }}
          onDragEnd={(_, info) => { if (info.offset.y > 120) onClose(); }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          onClick={(e) => e.stopPropagation()}
          style={{ padding: '0 24px 24px' }}
        >
          <div
            style={{ padding: '12px 0 6px', cursor: 'grab', touchAction: 'none' }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="drawer__handle" style={{ margin: '0 auto' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px auto', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              👤
            </div>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>{studentName}</h2>
            <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>Toki Pona Student</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Vocabulary Progress</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>
                {totalLearned} <span style={{ fontSize: '1rem', color: '#888' }}>/ {vocabulary.length} Words</span>
              </div>
            </div>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Words Mastered</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>
                {statusCounts.mastered} <span style={{ fontSize: '1rem', color: '#888' }}>Words</span>
              </div>
            </div>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Concepts Mastered</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>
                {masteredConcepts} <span style={{ fontSize: '1rem', color: '#888' }}>/ {concepts.length} Concepts</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
