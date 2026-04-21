/* src/components/WordDetailDrawer.tsx */
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord } from '../types/mastery';

export default function WordDetailDrawer({ word, onClose, onAskLina, isSandboxMode }: { word: VocabWord; onClose: () => void; onAskLina: (p: string) => void; isSandboxMode: boolean }) {
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  return (
    <AnimatePresence>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="word-drawer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
        <div className="drawer__handle" />
        <div className="drawer__scroll-area">
          <h2 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{word.word}</h2>
          <div onClick={() => isSandboxMode && updateVocabStatus(word.id, 'mastered')} style={{ cursor: 'pointer', color: '#888', marginBottom: '24px' }}>
            {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {partsOfSpeech.map(pos => (
              <div key={pos} style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontWeight: 900, color: '#444', fontSize: '0.65rem' }}>{pos.toUpperCase()}</span>
                <button onClick={() => { onAskLina(`Practice ${word.word} as a ${pos}`); onClose(); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', marginLeft: '10px', cursor: 'pointer' }}>ASK LINA</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '12px' }}>✕ CLOSE</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
