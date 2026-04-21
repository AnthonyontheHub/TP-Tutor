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
  onAskLina, 
  isSandboxMode, 
  activeFilter, 
  sortMode, 
  sortDirection, 
  posFilter,
  setSortMode,
  setSortDirection,
  setPosFilter 
}: Props) {
  const { vocabulary, savePhrase } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressing = useRef(false);

  // Magnetic Suggestions Logic
  useEffect(() => {
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (selectedWords.length > 1 && apiKey) {
      const timer = setTimeout(async () => {
        const results = await fetchSentenceSuggestions(apiKey, selectedWords);
        setMagneticSuggestions(results);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setMagneticSuggestions([]);
    }
  }, [selectedWords]);

  const handlePointerDown = (word: string) => {
    if (selectedWords.length > 0) return; // Skip timer if we're already selecting

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

    if (isLongPressing.current) {
      isLongPressing.current = false;
      return; // Already handled by the timer
    }

    if (selectedWords.length > 0) {
      // Toggle selection in "Sticky Mode"
      setSelectedWords(prev => 
        prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
      );
      soundService.playBlip(600, 'sine', 0.02);
    } else {
      // Regular tap opens the drawer
      const target = vocabulary.find(v => v.word === word);
      if (target) setDrawerId(target.id);
    }
  };

  // The Actual Sorting/Filtering Logic
  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      const valA = String(a[sortMode] || '').toLowerCase();
      const valB = String(b[sortMode] || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <section className="mastery-grid">
      {/* SORTATION UI SECTION */}
      <div className="grid-controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)} className="sort-select">
          <option value="word">Sort: A-Z</option>
          <option value="status">Sort: Mastery</option>
          <option value="partOfSpeech">Sort: Type</option>
        </select>
        
        <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="btn-icon">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>

        <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} className="sort-select">
          <option value="All">All Types</option>
          <option value="noun">Nouns</option>
          <option value="verb">Verbs</option>
          <option value="adj">Adjectives</option>
        </select>
      </div>

      <div className="mastery-grid__cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
        {displayed.map((word) => (
          <div 
            key={word.id} 
            onPointerDown={() => handlePointerDown(word.word)} 
            onPointerUp={() => handlePointerUp(word.word)}
            style={{ 
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              transform: selectedWords.includes(word.word) ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'pointer',
              touchAction: 'none'
            }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {/* MAGNETIC BUILDER PANEL */}
      {selectedWords.length > 0 && (
        <div className="builder-panel" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '500px', background: '#1a1a1a', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div className="builder-content">
            {magneticSuggestions.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 800 }}>MAGNETIC GROUPINGS:</span>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '8px' }}>
                  {magneticSuggestions.map((s, i) => (
                    <button key={i} className="suggestion-pill" onClick={() => { onAskLina(`Is "${s}" correct?`); setSelectedWords([]); }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '15px', fontWeight: 700 }}>{selectedWords.join(' ')}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} className="btn-review" style={{ flex: 2 }}>ASK LINA</button>
              <button onClick={() => { savePhrase(selectedWords.join(' ')); setSelectedWords([]); }} className="btn-toggle active" style={{ flex: 1 }}>SAVE</button>
            </div>
            <button onClick={() => setSelectedWords([])} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#666', fontSize: '0.8rem' }}>Clear selection ✕</button>
          </div>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
