import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';
import type { MasteryStatus } from '../types/mastery';

interface Props { 
  onAskLina: (p: string) => void; 
  isSandboxMode: boolean; 
  activeFilter: MasteryStatus | null; 
  sortMode: 'alphabetical' | 'status' | 'frequency' | 'length' | 'type'; 
  sortDirection: 'asc' | 'desc'; 
  posFilter: string; 
}

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);

  const handlePointerDown = (word: string) => {
    isDragging.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        soundService.playBlip(523, 'sine', 0.05);
        setSelectedWords(prev => [...prev, word]);
      }
    }, 500);
  };

  const handlePointerUp = (word: string) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isDragging.current) return;

    if (selectedWords.length > 0) {
      if (selectedWords.includes(word)) {
        setSelectedWords(prev => prev.filter(w => w !== word));
      } else {
        soundService.playBlip(523, 'sine', 0.05);
        setSelectedWords(prev => [...prev, word]);
      }
    } else {
      const target = vocabulary.find(v => v.word === word);
      if (target) setDrawerId(target.id);
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      const field = sortMode === 'alphabetical' ? 'word' : sortMode;
      const valA = String(a[field as keyof typeof a] || '');
      const valB = String(b[field as keyof typeof b] || '');
      const comp = valA.localeCompare(valB);
      return sortDirection === 'asc' ? comp : -comp;
    });

  return (
    <section className="mastery-grid" onPointerMove={() => { isDragging.current = true; }}>
      <div className="mastery-grid__cards">
        {displayed.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          return (
            <div 
              key={word.id} 
              onPointerDown={() => handlePointerDown(word.word)} 
              onPointerUp={() => handlePointerUp(word.word)} 
              style={{ 
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                opacity: selectedWords.length > 0 && !isSelected ? 0.4 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
            </div>
          );
        })}
      </div>

      {selectedWords.length > 0 && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '800px', background: '#111', padding: '20px', borderRadius: '20px', border: '2px solid #3b82f6', zIndex: 3000 }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '10px', fontWeight: 'bold' }}>{selectedWords.join(' ')}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" a good sentence?`); setSelectedWords([]); }} style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>ASK LINA</button>
            <button onClick={() => setSelectedWords([])} style={{ padding: '12px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>CLEAR</button>
          </div>
        </div>
      )}

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
