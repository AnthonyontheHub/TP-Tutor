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
  setSortMode, setSortDirection, setPosFilter, isSandboxMode // Fixed: Extracted isSandboxMode
}: Props) {
  const { vocabulary, savePhrase } = useMasteryStore();
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
    // Clear the timeout if the user lifts their finger before 500ms
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // If this release was the end of a long press, consume the event and stop
    if (isLongPress.current) {
      isLongPress.current = false;
      return; 
    }

    // Normal tap logic
    if (selectedWords.length === 0) {
      // Not selecting anything yet, so open the drawer
      const target = vocabulary.find(v => v.word === word);
      if (target) setDrawerId(target.id);
    } else {
      // Already selecting words, so toggle this word
      setSelectedWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]);
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a: any, b: any) => {
      const field = sortMode === 'alphabetical' ? 'word' : sortMode;
      const valA = String(a[field] || '').toLowerCase();
      const valB = String(b[field] || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <div className="mastery-grid-container">
      <div className="grid-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select">
          <option value="alphabetical">A-Z</option>
          <option value="status">Mastery</option>
        </select>
        <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="btn-toggle">
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
          <button onClick={() => setSelectedWords([])} style={{ background: 'none', border: 'none', color: '#666', width: '100%', marginTop: '10px' }}>Cancel</button>
        </div>
      )}

      {/* Fixed: isSandboxMode is now properly passed instead of hardcoded to true */}
      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </div>
  );
}
