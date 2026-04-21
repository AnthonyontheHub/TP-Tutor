import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null; 
}

const STATUS_ORDER: MasteryStatus[] = [
  'not_started', 'introduced', 'practicing', 'confident', 'mastered',
];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // FIX: Swapped NodeJS.Timeout for ReturnType<typeof setTimeout> which is browser-safe
  const clickData = useRef<{ timer: ReturnType<typeof setTimeout>, wordId: string } | null>(null);

  const displayedVocab = activeFilter 
    ? vocabulary.filter(w => w.status === activeFilter)
    : vocabulary;

  const selectedWord = selectedId
    ? (vocabulary.find((w) => w.id === selectedId) ?? null)
    : null;

  const handleCardClick = (word: VocabWord) => {
    if (!isSandboxMode) {
      setSelectedId(word.id);
      return;
    }

    if (clickData.current && clickData.current.wordId === word.id) {
      // DOUBLE CLICK DETECTED!
      clearTimeout(clickData.current.timer);
      clickData.current = null;
      
      const currentIndex = STATUS_ORDER.indexOf(word.status);
      const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
      updateVocabStatus(word.id, STATUS_ORDER[nextIndex]);
    } else {
      // FIRST CLICK
      if (clickData.current) clearTimeout(clickData.current.timer);

      const timer = setTimeout(() => {
        setSelectedId(word.id); 
        clickData.current = null;
      }, 250); 
      
      clickData.current = { timer, wordId: word.id };
    }
  };

  return (
    <section className="mastery-grid">
      <h2 className="section-title">
        VOCABULARY{' '}
        <span className="section-title__count">
          — SHOWING {displayedVocab.length} {activeFilter ? 'FILTERED' : 'TOTAL'}
        </span>
      </h2>

      {displayedVocab.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic', background: '#111', borderRadius: '8px' }}>
          No words currently match this status.
        </div>
      ) : (
        <div className="mastery-grid__cards">
          {displayedVocab.map((word) => (
            <VocabCard
              key={word.id}
              word={word}
              onClick={() => handleCardClick(word)}
            />
          ))}
        </div>
      )}

      {selectedWord && (
        <WordDetailDrawer 
          word={selectedWord} 
          onClose={() => setSelectedId(null)} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode}
        />
      )}
    </section>
  );
}
