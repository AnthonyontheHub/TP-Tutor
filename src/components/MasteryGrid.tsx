import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  selectedWords: string[]; // NEW: Pass the array up to the Dashboard
  setSelectedWords: (words: string[]) => void;
}

const STATUS_ORDER: MasteryStatus[] = [
  'not_started', 'introduced', 'practicing', 'confident', 'mastered',
];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, selectedWords, setSelectedWords }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const clickData = useRef<{ lastTime: number, wordId: string } | null>(null);

  const displayedVocab = activeFilter 
    ? vocabulary.filter(w => w.status === activeFilter)
    : vocabulary;

  const selectedWord = drawerId
    ? (vocabulary.find((w) => w.id === drawerId) ?? null)
    : null;

  const handleCardClick = (word: VocabWord) => {
    const now = Date.now();
    const isSameWord = clickData.current?.wordId === word.id;
    const timeSinceLastClick = isSameWord ? (now - clickData.current!.lastTime) : Infinity;
    clickData.current = { lastTime: now, wordId: word.id };

    // ⚡ DOUBLE TAP: Level Up (Sandbox only)
    if (isSandboxMode && isSameWord && timeSinceLastClick < 350) {
      const currentIndex = STATUS_ORDER.indexOf(word.status);
      const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
      updateVocabStatus(word.id, STATUS_ORDER[nextIndex]);
      clickData.current = null; 
      return;
    } 

    // 👆 SINGLE TAP: Toggle Selection
    if (selectedWords.includes(word.word)) {
      // If already selected, maybe we want to open the drawer on a second "slow" tap?
      // Or just deselect it. Let's make it: Tap 1 = Select, Tap 2 = Open Drawer.
      setDrawerId(word.id);
    } else {
      setSelectedWords([...selectedWords, word.word]);
    }
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])}>
      <h2 className="section-title">
        VOCABULARY — {activeFilter ? activeFilter.toUpperCase() : 'SELECT WORDS TO BUILD PHRASES'}
      </h2>

      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          const isDimmed = selectedWords.length > 0 && !isSelected;

          return (
            <div 
              key={word.id}
              onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{
                transform: isSelected ? 'scale(1.1)' : (isDimmed ? 'scale(0.92)' : 'scale(1)'),
                opacity: isDimmed ? 0.35 : 1,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                zIndex: isSelected ? 10 : 1,
                cursor: 'pointer'
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isSelected && (
                 <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedWords(selectedWords.filter(w => w !== word.word)); }}
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', zIndex: 11 }}
                 >✕</button>
              )}
            </div>
          );
        })}
      </div>

      {selectedWord && (
        <WordDetailDrawer 
          word={selectedWord} 
          onClose={() => setDrawerId(null)} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode}
        />
      )}
    </section>
  );
}
