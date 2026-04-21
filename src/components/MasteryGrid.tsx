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
  sortMode: 'word' | 'status' | 'partOfSpeech'; 
  sortDirection: 'asc' | 'desc'; 
  posFilter: string;
  setSortMode: (mode: any) => void;
  setSortDirection: (dir: any) => void;
  setPosFilter: (pos: string) => void;
}

export default function MasteryGrid({ 
  onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter,
  setSortMode, setSortDirection, setPosFilter 
}: Props) {
  const { vocabulary, savePhrase } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressing = useRef(false);

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
    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      soundService.playBlip(523.25, 'sine', 0.05);
      setSelectedWords([word]);
    }, 500);
  };

  const handlePointerUp = (word: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isLongPressing.current) return;

    if (selectedWords.length > 0) {
      setSelectedWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]);
    } else {
      const target = vocabulary.find(v => v.word === word);
      if (target) setDrawerId(target.id);
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      const valA = String(a[sortMode] || '').toLowerCase();
      const valB = String(b[sortMode] || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <div className="mastery-grid-wrapper">
      {/* PERSISTENT SORTING UI */}
      <div className="grid-toolbar" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)}>
          <option value="word">Alphabetical</option>
          <option value="status">Mastery Level</option>
        </select>
        <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
          {sortDirection === 'asc' ? 'Sort ↑' : 'Sort ↓'}
        </button>
        <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
          <option value="All">All Parts</option>
          <option value="noun">Nouns</option>
          <option value="verb">Verbs</option>
        </select>
      </div>

      <div className="mastery-grid__cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
        {displayed.map((word) => (
          <div 
            key={word.id} 
            onPointerDown={() => handlePointerDown(word.word)} 
            onPointerUp={() => handlePointerUp(word.word)}
            style={{ 
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              transform: selectedWords.includes(word.word) ? 'translateY(-4px)' : 'none',
              transition: 'all 0.2s ease',
              touchAction: 'none'
            }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="magnetic-sentence-builder">
          <div className="builder-content">
            <div className="builder-text">{selectedWords.join(' ')}</div>
            <div className="builder-actions">
              <button onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }}>ASK LINA</button>
              <button onClick={() => setSelectedWords([])} className="btn-cancel">✕</button>
            </div>
          </div>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </div>
  );
}
