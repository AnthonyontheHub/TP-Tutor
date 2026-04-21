import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_META } from '../types/mastery';
import type { VocabWord } from '../types/mastery';

interface Props {
  word: VocabWord;
  onClose: () => void;
  // NEW: A function to send a prompt to Lina
  onAskLina: (prompt: string) => void; 
}

export default function WordDetailDrawer({ word, onClose, onAskLina }: Props) {
  // Split the "noun / verb" string into an array so we can list them out
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());

  function handleAskLina(pos?: string) {
    const prompt = pos 
      ? `toki Lina, can we practice using "${word.word}" as a ${pos}?`
      : `toki Lina, I want to discuss the word "${word.word}".`;
    
    onAskLina(prompt);
    onClose(); // Close the drawer automatically
  }

  return (
    <AnimatePresence>
      <motion.div
        className="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className="word-drawer"
        role="dialog"
        aria-modal="true"
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        initial={{ y: '100%' }}
        animate={{ y: '50%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 150) onClose();
        }}
        dragSnapToOrigin={false}
        style={{ height: '100vh', top: 0, position: 'fixed', zIndex: 1000 }}
      >
        <div className="word-drawer__drag-zone" style={{ width: '100%', padding: '12px 0', cursor: 'grab' }}>
          <div className="word-drawer__handle" style={{ width: '40px', height: '5px', backgroundColor: '#888', borderRadius: '10px', margin: '0 auto' }} />
        </div>

        <div className="word-drawer__content" style={{ padding: '0 20px 40px' }}>
          <div className="word-drawer__meta">
            <span className="word-drawer__word">{word.word}</span>
            <span className="word-drawer__status" style={{ display: 'block', marginTop: '4px', fontSize: '0.9rem', color: '#666' }}>
              Status: {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
            </span>
            <span className="word-drawer__meanings">{word.meanings}</span>
          </div>

          <div className="word-drawer__section-label">PARTS OF SPEECH & EXAMPLES</div>

          <div className="word-drawer__examples-list">
            {partsOfSpeech.map((pos) => (
              <div key={pos} style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>{pos}</span>
                  <button 
                    onClick={() => handleAskLina(pos)}
                    style={{ fontSize: '0.75rem', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc' }}
                  >
                    💬 Ask Lina
                  </button>
                </div>
                <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.9rem', color: '#555' }}>
                  {/* Note: We will need to add actual example sentences to your data file later! */}
                  (Example sentences coming soon...)
                </p>
              </div>
            ))}
          </div>

          <button 
             style={{ width: '100%', padding: '12px', marginTop: '10px', cursor: 'pointer', borderRadius: '8px', background: '#333', color: 'white', border: 'none' }}
             onClick={() => handleAskLina()}
          >
            DISCUSS "{word.word.toUpperCase()}" WITH LINA
          </button>

          <button className="word-drawer__close" onClick={onClose} style={{ marginTop: '16px' }}>
            ✕&nbsp;&nbsp;CLOSE
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
