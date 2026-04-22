import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';
import { fetchSentenceSuggestions } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface Props { 
  onAskLina: (p: string) => void; 
  isSandboxMode: boolean; 
  activeFilter: MasteryStatus | null; 
  sortMode: string; 
  sortDirection: 'asc' | 'desc'; 
  posFilter: string;
  setSortMode: (mode: any) => void;
  setSortDirection: (dir: any) => void;
  setPosFilter: (pos: string) => void;
}

export default function MasteryGrid({ 
  onAskLina, activeFilter, sortMode, sortDirection, posFilter, 
  setSortMode, setSortDirection 
}: Props) {
  const { vocabulary } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressActive = useRef(false);

  const handlePointerDown = (word: string) => {
    isLongPressActive.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true;
      soundService.playBlip(523.25, 'sine', 0.05);
      setSelectedWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]);
    }, 500);
  };

  const handlePointerUp = (word: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (!isLongPressActive.current) {
      if (selectedWords.length > 0) {
        setSelectedWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]);
      } else {
        const target = vocabulary.find(v => v.word === word);
        if (target) setDrawerId(target.id);
      }
    }
    isLongPressActive.current = false;
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.toLowerCase().includes(posFilter.toLowerCase()))
    .sort((a: any, b: any) => {
      const field = sortMode === 'alphabetical' ? 'word' : sortMode;
      const valA = String(a[field] || '').toLowerCase();
      const valB = String(b[field] || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const selectedVocab = vocabulary.find(v => v.id === drawerId);

  return (
    <div className="mastery-grid-container">
      <div className="grid-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select" style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '8px', borderRadius: '6px' }}>
          <option value="alphabetical">A-Z</option>
          <option value="status">Mastery</option>
        </select>
        <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="btn-toggle" style={{ flex: 'none', width: '40px' }}>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <div className="mastery-grid__cards">
        {displayed.map((word) => (
          <div 
            key={word.id} 
            onPointerDown={() => handlePointerDown(word.word)} 
            onPointerUp={() => handlePointerUp(word.word)}
            style={{ 
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              touchAction: 'none',
              cursor: 'pointer'
            }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel">
          <div className="builder-content">
            <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px', fontWeight: 'bold' }}>{selectedWords.join(' ')}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} className="btn-review" style={{ margin: 0 }}>ASK LINA</button>
              <button onClick={() => setSelectedWords([])} className="btn-toggle" style={{ flex: '0 0 100px' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {drawerId && selectedVocab && (
        <WordDetailDrawer word={selectedVocab} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={true} />
      )}
    </div>
  );
}
