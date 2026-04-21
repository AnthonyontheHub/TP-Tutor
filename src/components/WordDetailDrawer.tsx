import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';

interface Props {
  word: VocabWord;
  onClose: () => void;
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
}

export default function WordDetailDrawer({ word, onClose, onAskLina, isSandboxMode }: Props) {
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="word-drawer"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="drawer__handle" />
        <div className="drawer__scroll-area">
          <h2 style={{ fontSize: '2.4rem', margin: '0 0 8px', letterSpacing: '0.05em' }}>{word.word}</h2>
          <div 
            onClick={() => isSandboxMode && updateVocabStatus(word.id, 'mastered')} // simplified for example
            style={{ cursor: 'pointer', color: '#888', marginBottom: '24px', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {partsOfSpeech.map(pos => (
              <div key={pos} style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 900, color: '#444', fontSize: '0.65rem', letterSpacing: '0.1em' }}>{pos.toUpperCase()}</span>
                  <button onClick={() => { onAskLina(`Practice ${word.word} as a ${pos}`); onClose(); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>ASK LINA</button>
                </div>
                <p style={{ margin: 0, fontStyle: 'italic', color: '#ccc' }}>Example sentence loading...</p>
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
