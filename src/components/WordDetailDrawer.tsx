import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';

const STATUS_ORDER: MasteryStatus[] = [
  'not_started',
  'introduced',
  'practicing',
  'confident',
  'mastered',
];

interface Props {
  word: VocabWord;
  onClose: () => void;
}

export default function WordDetailDrawer({ word, onClose }: Props) {
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  function handleStatus(status: MasteryStatus) {
    updateVocabStatus(word.id, status);
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <motion.div
        className="word-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${word.word}`}
        // Drag configuration
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        // Snap Logic: 0 is full screen (top), 50% is half, 100% is closed
        initial={{ y: '100%' }}
        animate={{ y: '50%' }} // Opens to half-screen by default
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 150) {
            onClose(); // Close if dragged down significantly
          }
        }}
        // Snap points for Half/Full Screen
        dragSnapToOrigin={false}
        whileDrag={{ cursor: 'grabbing' }}
        style={{ 
          height: '100vh', 
          top: 0,
          position: 'fixed',
          zIndex: 1000
        }}
      >
        {/* Gray Draggable Handle */}
        <div className="word-drawer__drag-zone" style={{ width: '100%', padding: '12px 0', cursor: 'grab' }}>
          <div 
            className="word-drawer__handle" 
            style={{ 
              width: '40px', 
              height: '5px', 
              backgroundColor: '#888', 
              borderRadius: '10px', 
              margin: '0 auto' 
            }} 
            aria-hidden="true" 
          />
        </div>

        <div className="word-drawer__content" style={{ padding: '0 20px 40px' }}>
          <div className="word-drawer__meta">
            <span className="word-drawer__word">{word.word}</span>
            <span className="word-drawer__pos">{word.partOfSpeech}</span>
            <span className="word-drawer__meanings">{word.meanings}</span>
          </div>

          <div className="word-drawer__section-label">SET STATUS</div>

          <div className="word-drawer__status-buttons">
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status];
              const isActive = word.status === status;
              return (
                <button
                  key={status}
                  className={`status-btn status-btn--${status}${isActive ? ' status-btn--active' : ''}`}
                  onClick={() => handleStatus(status)}
                  aria-pressed={isActive}
                >
                  <span className="status-btn__emoji">{meta.emoji}</span>
                  <span className="status-btn__label">{meta.label.toUpperCase()}</span>
                  {isActive && <span className="status-btn__tick">◀</span>}
                </button>
              );
            })}
          </div>

          <button className="word-drawer__close" onClick={onClose}>
            ✕&nbsp;&nbsp;CLOSE
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
