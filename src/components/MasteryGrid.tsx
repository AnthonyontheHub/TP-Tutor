/* src/components/MasteryGrid.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';
import { fetchSentenceSuggestions } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface Props { onAskLina: (p: string) => void; isSandboxMode: boolean; activeFilter: MasteryStatus | null; sortMode: any; sortDirection: any; posFilter: string; }

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const savePhrase = useMasteryStore((s) => s.savePhrase);
  
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [linaSuggestions, setLinaSuggestions] = useState<string[]>([]);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (selectedWords.length > 1 && apiKey) {
      const timer = setTimeout(async () => {
        const results = await fetchSentenceSuggestions(apiKey, selectedWords);
        setLinaSuggestions(results);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedWords]);

  const handlePointerDown = (word: string) => {
    isDragging.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        soundService.playBlip(523, 'sine', 0.05);
        setSelectedWords(prev => prev.includes(word) ? prev : [...prev, word]);
        longPressTimer.current = null;
      }
    }, 500);
  };

  const handlePointerUp = (word: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
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
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      const field = sortMode === 'alphabetical' ? 'word' : sortMode;
      const valA = String(a[field as keyof typeof a] || '');
      const valB = String(b[field as keyof typeof b] || '');
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <section onPointerMove={() => { isDragging.current = true; }}>
      <div className="mastery-grid__cards">
        {displayed.map((word) => (
          <div key={word.id} onPointerDown={() => handlePointerDown(word.word)} onPointerUp={() => handlePointerUp(word.word)}
               style={{ opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1, transition: 'all 0.2s' }}>
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 3000, pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: '900px', background: '#0a0a0a', border: '2px solid #3b82f6', borderBottom: 'none', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', pointerEvents: 'auto', margin: '0 10px', boxShadow: '0 -10px 30px rgba(0,0,0,0.5)' }}>
            
            {linaSuggestions.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.6rem', color: '#3b82f6', marginBottom: '8px', fontWeight: 'bold' }}>LINA'S SUGGESTIONS:</div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                  {linaSuggestions.map((s, i) => (
                    <button key={i} onClick={() => { onAskLina(`Is "${s}" correct?`); setSelectedWords([]); }} 
                            style={{ whiteSpace: 'nowrap', background: '#1a1a1a', color: '#fff', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '15px', fontWeight: 'bold' }}>{selectedWords.join(' ')}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <button onClick={() => { onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} 
                      style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>ASK LINA</button>
              <button onClick={() => { savePhrase(selectedWords.join(' ')); setSelectedWords([]); }} 
                      style={{ padding: '14px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '12px', cursor: 'pointer' }}>SAVE 📌</button>
            </div>
            <button onClick={() => setSelectedWords([])} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#444', fontSize: '0.7rem', cursor: 'pointer' }}>CLEAR ✕</button>
          </div>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
