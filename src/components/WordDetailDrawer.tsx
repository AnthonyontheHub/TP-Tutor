import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';

const TIER_RANGES: Record<MasteryStatus, [number, number]> = {
  not_started: [0,  19],
  introduced:  [20, 39],
  practicing:  [40, 64],
  confident:   [65, 84],
  mastered:    [85, 100],
};
const NEXT_STATUS: Partial<Record<MasteryStatus, MasteryStatus>> = {
  not_started: 'introduced',
  introduced:  'practicing',
  practicing:  'confident',
  confident:   'mastered',
};
const NEXT_THRESHOLD: Partial<Record<MasteryStatus, number>> = {
  not_started: 20, introduced: 40, practicing: 65, confident: 85,
};
const NEXT_COLOR: Record<MasteryStatus, string> = {
  not_started: '#1d4ed8',
  introduced:  '#92400e',
  practicing:  '#16a34a',
  confident:   '#22c55e',
  mastered:    '#22c55e',
};

function tierProgress(score: number, status: MasteryStatus): number {
  const [lo, hi] = TIER_RANGES[status];
  return Math.min(1, Math.max(0, (score - lo) / (hi - lo)));
}

export default function WordDetailDrawer({ isOpen, word, onClose, onAskLina, isSandboxMode }: { isOpen: boolean; word?: VocabWord | null; onClose: () => void; onAskLina: (p: string) => void; isSandboxMode: boolean }) {
  const partsOfSpeech = word?.partOfSpeech?.split('/').map(p => p.trim()) ?? [];
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  return (
    <AnimatePresence>
      {isOpen && word && (
        <motion.div 
          key="backdrop" 
          className="drawer-backdrop" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
        />
      )}
      {isOpen && word && (
        <motion.div 
          key="drawer" 
          className="word-drawer" 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          onClick={(e) => e.stopPropagation()}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="drawer__handle" />
          <div className="drawer__scroll-area">
            <h2 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{word.word}</h2>
            <div
              onClick={() => isSandboxMode && updateVocabStatus(word.id, 'mastered')}
              style={{ cursor: 'pointer', color: '#888', marginBottom: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
            </div>

            {/* Confidence progress bar — shows position within current tier */}
            {word.status !== 'mastered' && (
              <div style={{ marginBottom: '20px' }}>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${tierProgress(word.confidenceScore ?? 0, word.status) * 100}%`,
                      background: NEXT_COLOR[word.status],
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '4px', fontWeight: 700 }}>
                  {Math.max(0, (NEXT_THRESHOLD[word.status] ?? 100) - (word.confidenceScore ?? 0))} pts to {STATUS_META[NEXT_STATUS[word.status]!].label}
                </div>
              </div>
            )}
            {word.status === 'mastered' && <div style={{ marginBottom: '20px' }} />}
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
      )}
    </AnimatePresence>
  );
}
