import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord } from '../types/mastery';

export default function WordDetailDrawer({ word, onClose, onAskLina, isSandboxMode }: { word: VocabWord; onClose: () => void; onAskLina: (p: string) => void; isSandboxMode: boolean }) {
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  return (
    <AnimatePresence>
      <motion.div 
        className="side-drawer" 
        initial={{ x: '100%' }} 
        animate={{ x: '0%' }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="drawer__scroll-area">
          <h2 style={{ fontSize: '2.4rem', marginBottom: '8px', marginTop: '20px' }}>{word.word}</h2>
          <div 
            onClick={() => isSandboxMode && updateVocabStatus(word.id, 'mastered')}
            style={{ cursor: 'pointer', color: '#888', marginBottom: '24px', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {partsOfSpeech.map(pos => (
              <div key={pos} style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 900, color: '#444', fontSize: '0.65rem' }}>{pos.toUpperCase()}</span>
                  <button onClick={() => { onAskLina(`toki Lina! Can we practice using "${word.word}" as a ${pos}?`); onClose(); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>ASK LINA</button>
                </div>
                <p style={{ marginTop: '8px', color: '#ccc', fontStyle: 'italic' }}>{word.meanings}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>✕ CLOSE</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
