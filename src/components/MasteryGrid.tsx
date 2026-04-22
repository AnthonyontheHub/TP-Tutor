import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  setSortMode: (mode: string) => void;
  setSortDirection: (dir: 'asc' | 'desc') => void;
  setPosFilter: (pos: string) => void;
}

export default function MasteryGrid({ 
  onAskLina, activeFilter, sortMode, sortDirection, posFilter, 
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
    if (selectedWords.length > 0 && apiKey) {
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

  const handleSuggestionAdd = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords(prev => [...prev, word]);
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      // Extended Sorting Logic Implementation
      if (sortMode === 'length') {
        return sortDirection === 'asc' ? a.word.length - b.word.length : b.word.length - a.word.length;
      }
      if (sortMode === 'type') {
        const comp = a.partOfSpeech.localeCompare(b.partOfSpeech);
        return sortDirection === 'asc' ? comp : -comp;
      }
      // Assuming frequency is alphabetical fallback since it wasn't tracked in schema
      const field = sortMode === 'alphabetical' || sortMode === 'frequency' ? 'word' : sortMode;
      const valA = String(a[field as keyof typeof a] || '').toLowerCase();
      const valB = String(b[field as keyof typeof b] || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <div className="mastery-grid-container">
      <div className="grid-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select">
          <option value="alphabetical">A-Z</option>
          <option value="status">Mastery Level</option>
          <option value="length">Word Length</option>
          <option value="type">Part of Speech</option>
          <option value="frequency">Frequency</option>
        </select>
        <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="btn-toggle" style={{ flex: '0 0 50px' }}>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <div className="mastery-grid__cards">
        {displayed.map((word, i) => (
          <motion.div 
            key={word.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02, ease: "easeOut" }} // Staggered bottom-up entry
            onPointerDown={() => handlePointerDown(word.word)} 
            onPointerUp={() => handlePointerUp(word.word)}
            style={{ 
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              touchAction: 'none'
            }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </motion.div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel" style={{ position: 'fixed', bottom: '20px', left: '10px', right: '10px', background: '#222', padding: '15px', borderRadius: '12px', zIndex: 100, border: '2px solid #3b82f6', boxShadow: '0 -10px 30px rgba(0,0,0,0.8)' }}>
          <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold' }}>{selectedWords.join(' ')}</div>
          
          {/* Render Missing Magnetic Suggestions */}
          {magneticSuggestions.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px', scrollbarWidth: 'none' }}>
              {magneticSuggestions.map(s => (
                <button key={s} className="suggestion-pill" onClick={() => handleSuggestionAdd(s)}>{s}</button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>ASK LINA</button>
            <button onClick={() => setSelectedWords([])} style={{ flex: '0 0 auto', padding: '12px', background: '#444', border: 'none', color: '#fff', borderRadius: '8px' }}>✕</button>
          </div>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </div>
  );
}
