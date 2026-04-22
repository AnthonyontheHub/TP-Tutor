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
  setSortMode: (mode: any) => void;
  setSortDirection: (dir: any) => void;
  setPosFilter: (pos: string) => void;
}

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

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a: any, b: any) => {
      let valA, valB;
      if (sortMode === 'length') { valA = a.word.length; valB = b.word.length; }
      else if (sortMode === 'type') { valA = a.partOfSpeech; valB = b.partOfSpeech; }
      else {
        const field = sortMode === 'alphabetical' ? 'word' : sortMode;
        valA = String(a[field] || '').toLowerCase();
        valB = String(b[field] || '').toLowerCase();
      }
      if (typeof valA === 'string') return sortDirection === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  return (
    <div className="mastery-grid-container">
      <div className="grid-toolbar">
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select">
          <option value="alphabetical">A-Z</option>
          <option value="status">Mastery</option>
          <option value="length">Length</option>
          <option value="type">Type</option>
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
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}
            onPointerDown={() => handlePointerDown(word.word)} 
            onPointerUp={() => handlePointerUp(word.word)}
            style={{ opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1, touchAction: 'none' }}
          >
            <VocabCard word={word} />
          </motion.div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel" style={{ position: 'fixed', bottom: '20px', left: '10px', right: '10px', background: '#111', padding: '15px', borderRadius: '16px', zIndex: 100, border: '2px solid #3b82f6' }}>
          <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold' }}>{selectedWords.join(' ')}</div>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '5px' }}>
            {magneticSuggestions.map((s, idx) => (
              <button key={idx} className="suggestion-pill" onClick={() => setSelectedWords([...selectedWords, s])}>{s}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} className="btn-review" style={{ margin: 0 }}>ASK LINA</button>
            <button onClick={() => setSelectedWords([])} style={{ background: '#333', border: 'none', color: '#888', borderRadius: '8px', padding: '0 15px' }}>✕</button>
          </div>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </div>
  );
}
