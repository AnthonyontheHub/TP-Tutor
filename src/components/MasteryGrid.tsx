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
  sortMode: any; 
  sortDirection: any; 
  posFilter: string; 
}

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter }: Props) {
  const { vocabulary, savePhrase } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // RESTORED: Fetch the blue "Magnetic" grammar bubbles
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

  const handlePointerDown = (e: React.PointerEvent, word: string) => {
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    
    // If we are already in selection mode, don't need a long press
    if (selectedWords.length > 0) return;

    longPressTimer.current = setTimeout(() => {
      soundService.playBlip(523.25, 'sine', 0.05);
      setSelectedWords([word]);
      longPressTimer.current = null;
    }, 450);
  };

  const handlePointerUp = (e: React.PointerEvent, word: string) => {
    const dist = Math.sqrt(
      Math.pow(e.clientX - touchStartPos.current.x, 2) + 
      Math.pow(e.clientY - touchStartPos.current.y, 2)
    );

    // If the pointer moved more than 10px, treat it as a drag/scroll and ignore
    if (dist > 10) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      return;
    }

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;

      if (selectedWords.length > 0) {
        // Toggle selection
        if (selectedWords.includes(word)) {
          setSelectedWords(prev => prev.filter(w => w !== word));
        } else {
          soundService.playBlip(523.25, 'sine', 0.05);
          setSelectedWords(prev => [...prev, word]);
        }
      } else {
        // Single tap opens drawer
        const target = vocabulary.find(v => v.word === word);
        if (target) setDrawerId(target.id);
      }
    } else if (selectedWords.length > 0) {
        // This handles the case where the long press timer already fired
        if (selectedWords.includes(word)) {
            setSelectedWords(prev => prev.filter(w => w !== word));
          } else {
            soundService.playBlip(523.25, 'sine', 0.05);
            setSelectedWords(prev => [...prev, word]);
          }
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a: any, b: any) => {
      const field = sortMode === 'alphabetical' ? 'word' : sortMode;
      const valA = String(a[field] || '');
      const valB = String(b[field] || '');
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <section>
      <div className="mastery-grid__cards">
        {displayed.map((word) => (
          <div 
            key={word.id} 
            onPointerDown={(e) => handlePointerDown(e, word.word)} 
            onPointerUp={(e) => handlePointerUp(e, word.word)}
            style={{ 
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              transform: selectedWords.includes(word.word) ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s',
              touchAction: 'none' // Critical for pointer events to work reliably on mobile browsers
            }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel">
          <div className="builder-content">
            {magneticSuggestions.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 900, marginBottom: '10px', letterSpacing: '0.05em' }}>MAGNETIC GROUPINGS:</div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
                  {magneticSuggestions.map((s, i) => (
                    <button 
                      key={i} 
                      className="suggestion-pill"
                      onClick={() => { onAskLina(`Is "${s}" correct?`); setSelectedWords([]); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '20px', fontWeight: 900 }}>
              {selectedWords.join(' ')}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => { onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} 
                className="btn-review" style={{ margin: 0 }}
              >
                ASK LINA
              </button>
              <button 
                onClick={() => { savePhrase(selectedWords.join(' ')); setSelectedWords([]); }} 
                className="btn-toggle active"
              >
                SAVE 📌
              </button>
            </div>
            <button onClick={() => setSelectedWords([])} style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: '#444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>CLEAR SELECTION ✕</button>
          </div>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
