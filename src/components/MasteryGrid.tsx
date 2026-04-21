import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  sortMode: 'alphabetical' | 'status' | 'unlocked';
  sortDirection: 'asc' | 'desc'; /* <-- This is the piece TypeScript is missing! */
}


const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const comboRef = useRef<{ timer: ReturnType<typeof setTimeout>, wordId: string } | null>(null);

  const displayedVocab = [...vocabulary]
    .filter(w => !activeFilter || w.status === activeFilter)
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortMode === 'status') {
        comparison = STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      } else if (sortMode === 'unlocked') {
        comparison = (b.status === 'not_started' ? 1 : 0) - (a.status === 'not_started' ? 1 : 0);
      } else {
        comparison = a.word.localeCompare(b.word);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleCardClick = (word: VocabWord) => {
    // 1. Deselection / Drawer Logic
    if (selectedWords.includes(word.word)) {
      if (selectedWords.length === 1) setDrawerId(word.id);
      setSelectedWords(prev => prev.filter(w => w !== word.word));
      return;
    }
    
    // 2. Sandbox Combo Tapping (Status Upgrade)
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    }

    // 3. Selection Logic (Add word to builder)
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { 
      timer: setTimeout(() => { 
        setSelectedWords(prev => [...prev, word.word]); 
        comboRef.current = null; 
      }, 350), 
      wordId: word.id 
    };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])} style={{ paddingBottom: selectedWords.length > 1 ? '140px' : '20px' }}>
      <div 
        className="mastery-grid__cards" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
          gap: '10px',
          padding: '0 24px' 
        }}
      >
        {displayedVocab.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          const isSuperFocus = selectedWords.length === 1 && isSelected;
          
          return (
            <div key={word.id} onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{ 
                transform: isSuperFocus ? 'scale(1.8) translateY(-15px)' : (isSelected ? 'scale(1.1)' : (selectedWords.length > 0 && !isSelected ? 'scale(0.85)' : 'scale(1)')), 
                opacity: selectedWords.length > 0 && !isSelected ? 0.2 : 1, 
                transition: 'all 0.3s ease', 
                zIndex: isSuperFocus ? 100 : (isSelected ? 10 : 1), 
                cursor: 'pointer', 
                position: 'relative' 
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isSuperFocus && (
                <div style={{ position: 'absolute', bottom: '-30px', left: 0, right: 0, background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '9px', textAlign: 'center' }}>
                  {word.meanings}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedWords.length > 1 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', background: '#111', border: '1px solid #3b82f6', borderRadius: '16px', padding: '16px', zIndex: 1000 }}>
          <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>{selectedWords.join(' ')}</div>
          <button 
            onClick={() => { onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" a good sentence?`); setSelectedWords([]); }} 
            style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ASK LINA
          </button>
        </div>
      )}

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
