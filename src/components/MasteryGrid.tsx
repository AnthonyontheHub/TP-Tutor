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
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayedVocab = [...vocabulary]
    .filter(w => !activeFilter || w.status === activeFilter)
    .sort((a, b) => {
      if (sortMode === 'status') return STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      if (sortMode === 'unlocked') return (a.status === 'not_started' ? 1 : 0) - (b.status === 'not_started' ? 1 : 0);
      return a.word.localeCompare(b.word);
    });

  // START LONG PRESS (Enter Multi-select)
  const handleTouchStart = (word: VocabWord) => {
    if (selectedWords.length > 0) return; // Already in selection mode

    longPressRef.current = setTimeout(() => {
      if (window.navigator.vibrate) window.navigator.vibrate(50); // Haptic feedback
      setSelectedWords([word.word]);
      longPressRef.current = null;
    }, 500); // 0.5 seconds to trigger multi-select
  };

  const handleTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handleCardClick = (word: VocabWord) => {
    // 1. If we are ALREADY in multi-select mode
    if (selectedWords.length > 0) {
      if (selectedWords.includes(word.word)) {
        setSelectedWords(selectedWords.filter(w => w !== word.word));
      } else {
        setSelectedWords([...selectedWords, word.word]);
      }
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

    // 3. NORMAL TAP: Open Drawer
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => {
      setDrawerId(word.id);
      comboRef.current = null;
    }, 250), wordId: word.id };
  };

  return (
    <section className="mastery-grid">
      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const selectIndex = selectedWords.indexOf(word.word);
          const isSelected = selectIndex !== -1;
          const isDimmed = selectedWords.length > 0 && !isSelected;

          return (
            <div 
              key={word.id}
              onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              onTouchStart={() => handleTouchStart(word)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleTouchStart(word)} // Desktop support
              onMouseUp={handleTouchEnd}
              style={{
                transform: isSelected ? 'scale(1.05)' : (isDimmed ? 'scale(0.95)' : 'scale(1)'),
                opacity: isDimmed ? 0.4 : 1,
                transition: 'all 0.25s ease', 
                zIndex: isSelected ? 10 : 1, 
                cursor: 'pointer', position: 'relative',
                touchAction: 'none' // Critical for long-press on mobile
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              
              {isSelected && (
                <div style={{ 
                  position: 'absolute', top: '-8px', right: '-8px', 
                  background: '#3b82f6', color: 'white', 
                  borderRadius: '50%', width: '24px', height: '24px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '11px', fontWeight: 'bold', border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  {selectIndex + 1}
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
