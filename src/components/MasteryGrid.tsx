import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 
import type { SortMode } from './Dashboard';

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
  setSelectedWords: (words: string[]) => void;
  sortMode: SortMode;
}

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, selectedWords, setSelectedWords, sortMode }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const comboRef = useRef<{ timer: ReturnType<typeof setTimeout>, wordId: string } | null>(null);

  // SORTING ENGINE
  const displayedVocab = [...vocabulary]
    .filter(w => !activeFilter || w.status === activeFilter)
    .sort((a, b) => {
      if (sortMode === 'status') {
        return STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      }
      if (sortMode === 'unlocked') {
        const aVal = a.status === 'not_started' ? 1 : 0;
        const bVal = b.status === 'not_started' ? 1 : 0;
        return aVal - bVal; // Known words first
      }
      return a.word.localeCompare(b.word); // Default Alphabetical
    });

  const handleCardClick = (word: VocabWord) => {
    // RAPID-FIRE COMBO (Sandbox Only)
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length];
      updateVocabStatus(word.id, nextStatus);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    } 

    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => {
      // Logic after the click-window closes
      if (selectedWords.includes(word.word)) {
        setDrawerId(word.id);
      } else {
        setSelectedWords([...selectedWords, word.word]);
      }
      comboRef.current = null;
    }, 350), wordId: word.id };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])}>
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
                cursor: 'pointer', position: 'relative'
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
            </div>
          );
        })}
      </div>
      {drawerId && (
        <WordDetailDrawer 
          word={vocabulary.find(v => v.id === drawerId)!} 
          onClose={() => { setDrawerId(null); setSelectedWords([]); }} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode} 
        />
      )}
    </section>
  );
}
