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
    // 1. DESELECT LOGIC (High Priority)
    // If the word is already selected, tapping it ALWAYS removes it. 
    // This stops the drawer from popping up accidentally.
    if (selectedWords.includes(word.word)) {
      setSelectedWords(selectedWords.filter(w => w !== word.word));
      return;
    }

    // 2. RAPID-FIRE COMBO (Sandbox Only)
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length];
      updateVocabStatus(word.id, nextStatus);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    } 

    // 3. SELECTION / DRAWER DELAY
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => {
      // If we aren't rapidly tapping for status, we select the word.
      // To open the drawer now, we can hold or we can add a specific icon.
      // For now, let's make it: Tap 1 = Select. To open drawer, use the "Ask Lina" flow or long-press.
      setSelectedWords([...selectedWords, word.word]);
      comboRef.current = null;
    }, 350), wordId: word.id };
  };

  return (
    <section className="mastery-grid">
      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          const isDimmed = selectedWords.length > 0 && !isSelected;

          return (
            <div 
              key={word.id}
              onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              onContextMenu={(e) => { e.preventDefault(); setDrawerId(word.id); }} // Right-click or Long-press for Drawer
              style={{
                transform: isSelected ? 'scale(1.1)' : (isDimmed ? 'scale(0.92)' : 'scale(1)'),
                opacity: isDimmed ? 0.35 : 1,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                zIndex: isSelected ? 10 : 1, 
                cursor: 'pointer', position: 'relative'
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isSelected && (
                <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#3b82f6', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {selectedWords.indexOf(word.word) + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {drawerId && (
        <WordDetailDrawer 
          word={vocabulary.find(v => v.id === drawerId)!} 
          onClose={() => setDrawerId(null)} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode} 
        />
      )}
    </section>
  );
}
