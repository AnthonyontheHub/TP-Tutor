import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
  setSelectedWords: (words: string[]) => void;
}

const STATUS_ORDER: MasteryStatus[] = [
  'not_started', 'introduced', 'practicing', 'confident', 'mastered',
];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, selectedWords, setSelectedWords }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  
  const [drawerId, setDrawerId] = useState<string | null>(null);
  
  // Track the "combo" timer for rapid-fire tapping
  const comboRef = useRef<{ timer: ReturnType<typeof setTimeout>, wordId: string } | null>(null);

  const displayedVocab = activeFilter 
    ? vocabulary.filter(w => w.status === activeFilter)
    : vocabulary;

  const selectedWord = drawerId
    ? (vocabulary.find((w) => w.id === drawerId) ?? null)
    : null;

  const handleCardClick = (word: VocabWord) => {
    // 1. If not in sandbox, just open the drawer or toggle selection
    if (!isSandboxMode) {
      if (selectedWords.includes(word.word)) setDrawerId(word.id);
      else setSelectedWords([...selectedWords, word.word]);
      return;
    }

    // 2. SANDBOX RAPID-FIRE LOGIC
    if (comboRef.current && comboRef.current.wordId === word.id) {
      // COMBO CONTINUED: Clear the "open drawer" timer and level up again
      clearTimeout(comboRef.current.timer);
      
      const currentIndex = STATUS_ORDER.indexOf(word.status);
      const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
      updateVocabStatus(word.id, STATUS_ORDER[nextIndex]);

      // Start a fresh 350ms window for the NEXT tap
      const newTimer = setTimeout(() => {
        comboRef.current = null;
      }, 350);
      comboRef.current = { timer: newTimer, wordId: word.id };
    } 
    else {
      // FIRST TAP: Start a window to see if this is a combo or a single action
      if (comboRef.current) clearTimeout(comboRef.current.timer);

      const timer = setTimeout(() => {
        // TIMER EXPIRED: This wasn't a rapid-fire combo, so perform normal tap action
        if (selectedWords.includes(word.word)) {
          setDrawerId(word.id);
        } else {
          setSelectedWords([...selectedWords, word.word]);
        }
        comboRef.current = null;
      }, 350);

      comboRef.current = { timer, wordId: word.id };
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
                cursor: 'pointer',
                position: 'relative'
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
          onClose={() => { setDrawerId(null); setSelectedWords([]); }} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode}
        />
      )}
    </section>
  );
}
