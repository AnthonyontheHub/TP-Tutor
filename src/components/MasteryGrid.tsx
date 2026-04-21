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

// Ensure the statuses cycle in the correct order
const STATUS_ORDER: MasteryStatus[] = [
  'not_started', 'introduced', 'practicing', 'confident', 'mastered',
];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus); // We need this to apply the cheat code
  
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // We use a 'ref' to track clicks so the component doesn't unnecessarily re-render
  const clickData = useRef<{ timer: NodeJS.Timeout, wordId: string } | null>(null);

  const displayedVocab = activeFilter 
    ? vocabulary.filter(w => w.status === activeFilter)
    : vocabulary;

  const selectedWord = selectedId
    ? (vocabulary.find((w) => w.id === selectedId) ?? null)
    : null;

  // CUSTOM DOUBLE-TAP LOGIC
  const handleCardClick = (word: VocabWord) => {
    // If we aren't testing, skip the delay and just open the drawer instantly
    if (!isSandboxMode) {
      setSelectedId(word.id);
      return;
    }

    if (clickData.current && clickData.current.wordId === word.id) {
      // DOUBLE CLICK DETECTED!
      clearTimeout(clickData.current.timer);
      clickData.current = null;
      
      // Cycle to the next level up
      const currentIndex = STATUS_ORDER.indexOf(word.status);
      const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
      updateVocabStatus(word.id, STATUS_ORDER[nextIndex]);
    } else {
      // FIRST CLICK
      if (clickData.current) clearTimeout(clickData.current.timer);

      // Start a 250ms countdown. If a second click doesn't happen, open the drawer.
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
              // Pass our new handler instead of directly opening the drawer
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
