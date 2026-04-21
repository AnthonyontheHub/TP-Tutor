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
  const [focusedId, setFocusedId] = useState<string | null>(null); 

  const clickData = useRef<{ lastTime: number, wordId: string } | null>(null);

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

    const now = Date.now();
    const isSameWord = clickData.current?.wordId === word.id;
    const timeSinceLastClick = isSameWord ? (now - clickData.current!.lastTime) : Infinity;

    clickData.current = { lastTime: now, wordId: word.id };

    if (isSameWord && timeSinceLastClick < 350) {
      // ⚡ FAST DOUBLE TAP DETECTED
      const currentIndex = STATUS_ORDER.indexOf(word.status);
      const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
      updateVocabStatus(word.id, STATUS_ORDER[nextIndex]);
      
      setFocusedId(word.id); 
      clickData.current = null; 
    } 
    else if (focusedId === word.id) {
      // 🐢 SLOW SECOND TAP 
      setSelectedId(word.id); 
    } 
    else {
      // 👆 FIRST TAP 
      setFocusedId(word.id);
    }
  };

  const clearFocus = () => {
    if (focusedId) setFocusedId(null);
  };

  return (
    <section className="mastery-grid" onClick={clearFocus}>
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
          {displayedVocab.map((word) => {
            const isFocused = focusedId === word.id;
            const isDimmed = focusedId !== null && focusedId !== word.id;

            return (
              <div 
                key={word.id}
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleCardClick(word);
                }}
                style={{
                  transform: isFocused ? 'scale(1.1)' : (isDimmed ? 'scale(0.92)' : 'scale(1)'),
                  opacity: isDimmed ? 0.35 : 1,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                  zIndex: isFocused ? 10 : 1,
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <VocabCard 
                  word={word} 
                  onClick={() => {}} /* FIX: Satisfies TypeScript requirement */
                />
              </div>
            );
          })}
        </div>
      )}

      {selectedWord && (
        <WordDetailDrawer 
          word={selectedWord} 
          onClose={() => {
            setSelectedId(null);
            setFocusedId(null); 
          }} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode}
        />
      )}
    </section>
  );
}
