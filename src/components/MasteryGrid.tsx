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

const STATUS_HIERARCHY: MasteryStatus[] = [
  'not_started', 'introduced', 'practicing', 'confident', 'mastered'
];

export default function MasteryGrid({ 
  onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter, 
  setSortMode, setSortDirection, setPosFilter 
}: Props) {
  const { vocabulary } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (selectedWords.length > 1 && apiKey) {
      const timer = setTimeout(async () => {
        const results = await fetchSentenceSuggestions(apiKey, selectedWords);
        setMagneticSuggestions(results);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedWords]);

  const handlePointerDown = (word: string) => {
    if (selectedWords.length > 0) return;
    
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      soundService.playBlip(523.25, 'sine', 0.05);
      setSelectedWords([word]);
    }, 500);
  };

  const handlePointerUp = (word: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (isLongPress.current) {
      isLongPress.current = false;
      return; 
    }

    if (selectedWords.length === 0) {
      const target = vocabulary.find(v => v.word === word);
      if (target) setDrawerId(target.id);
    } else {
      setSelectedWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]);
    }
  };

  const displayed = vocabulary
    .filter(w => {
      // 1. Filter by Parts of Speech
      if (posFilter !== 'All' && !w.partOfSpeech.includes(posFilter)) return false;
      
      // 2. Cascade Filter (Show this level AND above, exclude below)
      if (activeFilter) {
        const filterIndex = STATUS_HIERARCHY.indexOf(activeFilter);
        const wordIndex = STATUS_HIERARCHY.indexOf(w.status);
        if (wordIndex < filterIndex) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // 3. Smart Sorting based on the Filter 
      // If a filter is active, force group them by status (active at top, ascending upwards)
      if (activeFilter || sortMode === 'status') {
        const indexA = STATUS_HIERARCHY.indexOf(a.status);
        const indexB = STATUS_HIERARCHY.indexOf(b.status);
        if (indexA !== indexB) {
          // If we have an active filter, ALWAYS sort ascending from the filter point
          if (activeFilter) return indexA - indexB; 
          // Otherwise obey the toggle direction
          return sortDirection === 'asc' ? indexA - indexB : indexB - indexA;
        }
      }

      // 4. Default / Fallback Alphabetical
      const valA = String(a.word || '').toLowerCase();
      const valB = String(b.word || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <div className="mastery-grid-container">
      <div className="grid-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select" style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#222', color: 'white', border: '1px solid #444', outline: 'none' }}>
          <option value="alphabetical">A-Z</option>
          <option value="status">Mastery Level</option>
        </select>
        <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="btn-toggle" style={{ flex: 0, padding: '0 20px' }}>
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
              touchAction: 'none'
            }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel" style={{ position: 'fixed', bottom: '20px', left: '10px', right: '10px', background: '#222', padding: '15px', borderRadius: '12px', zIndex: 100 }}>
          <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '10px' }}>{selectedWords.join(' ')}</div>
          <button onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} className="btn-review">ASK LINA</button>
          <button onClick={() => setSelectedWords([])} style={{ background: 'none', border: 'none', color: '#666', width: '100%', marginTop: '10px', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId) || null} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />
    </div>
  );
}
