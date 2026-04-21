/* src/components/MasteryGrid.tsx */
import { useState, useRef, useEffect, useMemo } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { fetchSentenceSuggestions } from '../services/linaService';
import { soundService } from '../services/soundService';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  sortMode: 'alphabetical' | 'status' | 'frequency' | 'length' | 'type';
  sortDirection: 'asc' | 'desc';
  posFilter: string; 
}

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];

const FREQUENCY_ORDER = [
  "mi", "li", "e", "toki", "pona", "ni", "a", "la", "ala", "sina", "lon", "jan", "tawa", "pi", "sona", "tenpo", "ona", "wile", "mute", "taso", "o", "kama", "ken", "pilin", "nimi", "ike", "lili", "tan", "tomo", "pali", "ma", "sitelen", "kepeken", "musi", "jo", "moku", "lukin", "sama", "telo", "lape", "seme", "kin", "ilo", "ale / ali", "pini", "ante", "suli", "ijo", "anu", "nasa", "kulupu", "suno", "pana", "kalama", "lipu", "tu", "nasin", "sin", "pakala", "en", "wawa", "olin", "lawa", "awen", "sewi", "seli", "kon", "soweli", "weka", "mu", "wan", "lete", "sike", "nanpa", "kasi", "moli", "kute", "suwi", "utala", "pimeja", "mama", "sijelo", "pan", "luka", "uta", "open", "ko", "jaki", "kala", "pu", "insa", "esun", "kili", "poka", "mani", "len", "user_is_anthony", "linja", "meli", "kiwen", "poki", "supa", "kule", "mije", "waso", "walo", "pipi", "palisa", "anpa", "noka", "akesi", "loje", "mun", "nena", "unpa", "sinpin", "selo", "monsi", "jelo", "laso", "oko", "alasa", "kipisi", "tonsi", "namako"
];

function getPermutations(array: string[]): string[] {
  if (array.length > 4) return []; 
  const result: string[][] = [];
  const permute = (arr: string[], m: string[] = []) => {
    if (arr.length === 0) result.push(m);
    else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };
  permute(array);
  return result.map(p => p.join(' '));
}

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const savePhrase = useMasteryStore((s) => s.savePhrase);
  
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [linaSuggestions, setLinaSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);
  const isDragging = useRef(false);
  const lastClickRef = useRef<{ id: string, time: number } | null>(null);

  const localShuffles = useMemo(() => {
    if (selectedWords.length < 2) return [];
    return getPermutations(selectedWords);
  }, [selectedWords]);

  useEffect(() => {
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (selectedWords.length > 1 && apiKey) {
      setIsSuggesting(true);
      const timer = setTimeout(async () => {
        const results = await fetchSentenceSuggestions(apiKey, selectedWords);
        setLinaSuggestions(results);
        setIsSuggesting(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setLinaSuggestions([]);
    }
  }, [selectedWords]);

  const displayedVocab = [...vocabulary]
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      let comparison = 0;
      if (sortMode === 'status') comparison = STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      else if (sortMode === 'frequency') {
        const rankA = FREQUENCY_ORDER.indexOf(a.word) === -1 ? 999 : FREQUENCY_ORDER.indexOf(a.word);
        const rankB = FREQUENCY_ORDER.indexOf(b.word) === -1 ? 999 : FREQUENCY_ORDER.indexOf(b.word);
        comparison = rankA - rankB;
      } 
      else if (sortMode === 'length') comparison = a.word.length - b.word.length;
      else if (sortMode === 'type') comparison = a.partOfSpeech.localeCompare(b.partOfSpeech);
      else comparison = a.word.localeCompare(b.word);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, word: VocabWord) => {
    const pos = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    touchStartPos.current = pos;
    isDragging.current = false;

    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        soundService.playBlip(523.25, 'sine', 0.05); 
        setSelectedWords(prev => [...prev, word.word]);
        longPressTimer.current = null;
      }
    }, 500);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const pos = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    const dist = Math.sqrt(Math.pow(pos.x - touchStartPos.current.x, 2) + Math.pow(pos.y - touchStartPos.current.y, 2));
    if (dist > 10) {
      isDragging.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handlePointerUp = (word: VocabWord, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); 
    if (isDragging.current) {
      touchStartPos.current = null;
      return;
    }

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      const now = Date.now();
      const isDoubleTap = lastClickRef.current?.id === word.id && (now - lastClickRef.current.time) < 300;
      
      if (isSandboxMode && isDoubleTap) {
        soundService.playBlip(880, 'sine', 0.1); 
        updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
        lastClickRef.current = null;
      } else if (selectedWords.length > 0) {
        // Selection is active: Simple tap adds/removes
        if (selectedWords.includes(word.word)) {
          soundService.playBlip(329.63, 'sine', 0.05);
          setSelectedWords(prev => prev.filter(w => w !== word.word));
        } else {
          soundService.playBlip(523.25, 'sine', 0.05);
          setSelectedWords(prev => [...prev, word.word]);
        }
      } else {
        // Normal mode: Open drawer
        lastClickRef.current = { id: word.id, time: now };
        setDrawerId(word.id);
      }
    }
    touchStartPos.current = null;
  };

  const clearSelection = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && selectedWords.length > 0) {
      soundService.playBlip(220, 'sine', 0.05);
      setSelectedWords([]);
    }
  };

  return (
    <section className="mastery-grid" onClick={clearSelection} style={{ paddingBottom: selectedWords.length > 0 ? '280px' : '20px' }}>
      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          return (
            <div 
              key={word.id} 
              onMouseDown={(e) => handlePointerDown(e, word)}
              onMouseMove={handlePointerMove}
              onMouseUp={(e) => handlePointerUp(word, e)}
              onTouchStart={(e) => handlePointerDown(e, word)}
              onTouchMove={handlePointerMove}
              onTouchEnd={(e) => handlePointerUp(word, e)}
              onContextMenu={(e) => e.preventDefault()}
              style={{ transform: isSelected ? 'scale(1.05)' : (selectedWords.length > 0 ? 'scale(0.92)' : 'scale(1)'), opacity: selectedWords.length > 0 && !isSelected ? 0.4 : 1, transition: 'all 0.2s ease', zIndex: isSelected ? 10 : 1, cursor: 'pointer', position: 'relative', userSelect: 'none' }}
            >
              <VocabCard word={word} onClick={() => {}} />
            </div>
          );
        })}
      </div>
      {selectedWords.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: '900px', background: '#0a0a0a', border: '2px solid #3b82f6', borderBottom: 'none', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', boxShadow: '0 -15px 40px rgba(0,0,0,0.9)', pointerEvents: 'auto', margin: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 900, letterSpacing: '0.1em' }}>SENTENCE BUILDER</div>
              <button onClick={() => setSelectedWords([])} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold' }}>CLEAR ✕</button>
            </div>
            {selectedWords.length > 1 && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.55rem', color: '#444', fontWeight: 'bold', marginBottom: '6px' }}>SHUFFLES:</div>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
                    {localShuffles.map((s, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedWords(s.split(' ')); }} style={{ whiteSpace: 'nowrap', background: '#111', border: '1px solid #333', color: '#888', padding: '5px 10px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '14px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.55rem', color: '#3b82f6', fontWeight: 'bold', marginBottom: '6px' }}>LINA'S SUGGESTIONS:</div>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
                    {isSuggesting ? <div style={{ fontSize: '0.7rem', color: '#444', fontStyle: 'italic' }}>thinking...</div> : linaSuggestions.map((s, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); soundService.playBlip(783.99, 'sine', 0.05); onAskLina(`Is "${s}" correct?`); setSelectedWords([]); }} style={{ whiteSpace: 'nowrap', background: '#1a1a1a', border: '1px solid #3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '16px', fontWeight: 'bold', wordBreak: 'break-word' }}>{selectedWords.join(' ')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <button onClick={() => { soundService.playBlip(880, 'sine', 0.1); onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" a good sentence?`); setSelectedWords([]); }} style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', letterSpacing: '0.05em' }}>ASK LINA</button>
              <button onClick={() => { soundService.playBlip(1046.50, 'sine', 0.1); savePhrase(selectedWords.join(' ')); setSelectedWords([]); }} style={{ padding: '14px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE 📌</button>
            </div>
          </div>
        </div>
      )}
      {drawerId && (
        <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => { setDrawerId(null); }} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />
      )}
    </section>
  );
}
