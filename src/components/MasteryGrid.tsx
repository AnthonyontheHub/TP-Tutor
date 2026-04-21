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

  const displayedVocab = [...vocabulary]
    .filter(w => !activeFilter || w.status === activeFilter)
    .sort((a, b) => {
      if (sortMode === 'status') return STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      if (sortMode === 'unlocked') return (a.status === 'not_started' ? 1 : 0) - (b.status === 'not_started' ? 1 : 0);
      return a.word.localeCompare(b.word);
    });

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.includes(word.word)) {
      if (selectedWords.length === 1) setDrawerId(word.id);
      else setSelectedWords(selectedWords.filter(w => w !== word.word));
      return;
    }
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    } 
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => { setSelectedWords([...selectedWords, word.word]); comboRef.current = null; }, 350), wordId: word.id };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])}>
      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const selectIndex = selectedWords.indexOf(word.word);
          const isSelected = selectIndex !== -1;
          const isOnlySelection = selectedWords.length === 1 && isSelected;
          return (
            <div key={word.id} onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{ 
                transform: isOnlySelection ? 'scale(1.8) translateY(-10px)' : (isSelected ? 'scale(1.1)' : (selectedWords.length > 0 ? 'scale(0.85)' : 'scale(1)')), 
                opacity: selectedWords.length > 0 && !isSelected ? 0.2 : 1, 
                transition: 'all 0.4s ease', 
                zIndex: isOnlySelection ? 100 : (isSelected ? 10 : 1), 
                cursor: 'pointer', position: 'relative' 
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isOnlySelection && <div style={{ position: 'absolute', bottom: '-35px', left: 0, right: 0, background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '0.45rem', textAlign: 'center' }}>{word.meanings}</div>}
            </div>
          );
        })}
      </div>
      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => { setDrawerId(null); setSelectedWords([]); }} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
