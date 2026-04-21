import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';

export default function MasteryGrid({ onAskLina, activeFilter }: any) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  
  const longPressTimer = useRef<any>(null);
  const isScrolling = useRef(false);

  const handlePointerDown = (word: string) => {
    isScrolling.current = false;
    // Long press to start selection mode
    longPressTimer.current = setTimeout(() => {
      if (!isScrolling.current) {
        soundService.playBlip(523, 'sine', 0.05);
        setSelectedWords(prev => [...prev, word]);
      }
    }, 500);
  };

  const handlePointerUp = (word: string, e: any) => {
    clearTimeout(longPressTimer.current);
    if (isScrolling.current) return;

    if (selectedWords.length > 0) {
      // If already in selection mode, just toggle words
      if (selectedWords.includes(word)) {
        setSelectedWords(prev => prev.filter(w => w !== word));
      } else {
        soundService.playBlip(523, 'sine', 0.05);
        setSelectedWords(prev => [...prev, word]);
      }
    } else {
      // Normal mode: open drawer
      setDrawerId(vocabulary.find(v => v.word === word)?.id || null);
    }
  };

  return (
    <section className="mastery-grid" onScroll={() => isScrolling.current = true}>
      <div className="mastery-grid__cards">
        {vocabulary.filter(w => !activeFilter || w.status === activeFilter).map((word) => (
          <div 
            key={word.id}
            onPointerDown={() => handlePointerDown(word.word)}
            onPointerUp={(e) => handlePointerUp(word.word, e)}
            style={{ opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.4 : 1 }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '800px', background: '#111', padding: '20px', borderRadius: '20px', border: '2px solid #3b82f6', zIndex: 3000 }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{selectedWords.join(' ')}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>ASK LINA</button>
            <button onClick={() => setSelectedWords([])} style={{ padding: '12px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff' }}>CLEAR</button>
          </div>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={true} />}
    </section>
  );
}
