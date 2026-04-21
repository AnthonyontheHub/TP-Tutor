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
  "mi", "li", "e", "toki", "pona", "ni", "a", "la", "ala", "sina", "lon", "jan", "tawa", "pi", "sona", "tenpo", "ona", "wile", "mute", "taso", "o", "kama", "ken", "pilin", "nimi", "ike", "lili", "tan", "tomo", "pali", "ma", "sitelen", "kepeken", "musi", "jo", "moku", "lukin", "sama", "telo", "lape", "seme", "kin", "ilo", "ale / ali", "pini", "ante", "suli", "ijo", "anu", "nasa", "kulupu", "suno", "pana", "kalama", "lipu", "tu", "nasin", "sin", "pakala", "en", "wawa", "olin", "lawa", "awen", "sewi", "seli", "kon", "soweli", "weka", "mu", "wan", "lete", "sike", "nanpa", "kasi", "moli", "kute", "suwi", "utala", "pimeja", "mama", "sijelo", "pan", "luka", "uta", "open", "ko", "jaki", "kala", "pu", "insa", "esun", "kili", "poka", "mani", "len", "linja", "meli", "kiwen", "poki", "supa", "kule", "mije", "waso", "walo", "pipi", "palisa", "anpa", "noka", "akesi", "loje", "mun", "nena", "unpa", "sinpin", "selo", "monsi", "jelo", "laso", "oko", "alasa", "kipisi", "tonsi", "namako"
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
  
  // Track clicks for the sandbox double-tap logic
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

  const handleCardClick = (word: VocabWord) => {
    const now = Date.now();
    const isDoubleTap = lastClickRef.current?.id === word.id && (now - lastClickRef.current.time) < 300;

    // 1. Double Tap Logic (Sandbox Status Upgrade)
    if (isSandboxMode && isDoubleTap) {
      soundService.playBlip(880, 'sine', 0.1); 
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      lastClickRef.current = null; // Reset
      return;
    }

    // 2. Single Tap Logic (Selection/Deselection)
    lastClickRef.current = { id: word.id, time: now };

    if (selectedWords.includes(word.word)) {
      // DESELECT
      soundService.playBlip(329.63, 'sine', 0.05); 
      if (selectedWords.length === 1) setDrawerId(word.id);
      setSelectedWords(prev => prev.filter(w => w !== word.word));
    } else {
      // SELECT
      soundService.playBlip(523.25, 'sine', 0.05); 
      setSelectedWords(prev => [...prev, word.word]);
    }
  };

  return (
    <section className="mastery-grid" onClick={() => { if(selectedWords.length > 0) soundService.playBlip(220, 'sine', 0.05); setSelectedWords([]); }} style={{ paddingBottom: selectedWords.length > 1 ? '240px' : '20px' }}>
      <div className="mastery-grid__cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', padding: '0 24px' }}>
        {displayedVocab.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          const isSuperFocus = selectedWords.length === 1 && isSelected;
          return (
            <div key={word.id} onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{ transform: isSuperFocus ? 'scale(1.8) translateY(-15px)' : (isSelected ? 'scale(1.1)' : (selectedWords.length > 0 && !isSelected ? 'scale(0.85)' : 'scale(1)')), opacity: selectedWords.length > 0 && !isSelected ? 0.2 : 1, transition: 'all 0.3s ease', zIndex: isSuperFocus ? 100 : (isSelected ? 10 : 1), cursor: 'pointer', position: 'relative' }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isSuperFocus && <div style={{ position: 'absolute', bottom: '-30px', left: 0, right: 0, background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '9px', textAlign: 'center' }}>{word.meanings}</div>}
            </div>
          );
        })}
      </div>

      {selectedWords.length > 1 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', background: '#111', border: '1px solid #3b82f6', borderRadius: '16px', padding: '16px', zIndex: 1000, boxShadow: '0 -10px 25px rgba(0,0,0,0.8)' }}>
          
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '0.05em' }}>LOCAL SHUFFLES:</div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
              {localShuffles.map((s, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); soundService.playBlip(659.25, 'sine', 0.03); setSelectedWords(s.split(' ')); }}
                  style={{ whiteSpace: 'nowrap', background: '#222', border: '1px solid #444', color: '#aaa', padding: '5px 10px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '14px', borderTop: '1px solid #222', paddingTop: '10px' }}>
            <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '0.05em' }}>LINA'S SUGGESTIONS:</div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
              {isSuggesting ? (
                <div style={{ fontSize: '0.7rem', color: '#444', fontStyle: 'italic' }}>thinking...</div>
              ) : linaSuggestions.map((s, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); soundService.playBlip(783.99, 'sine', 0.05); onAskLina(`Is "${s}" correct?`); setSelectedWords([]); }}
                  style={{ whiteSpace: 'nowrap', background: '#1a1a1a', border: '1px solid #3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px', borderTop: '1px solid #222', paddingTop: '10px', fontWeight: 'bold' }}>{selectedWords.join(' ')}</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
            <button onClick={() => { soundService.playBlip(880, 'sine', 0.1); onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" a good sentence?`); setSelectedWords([]); }} 
              style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              ASK LINA
            </button>
            <button onClick={() => { soundService.playBlip(1046.50, 'sine', 0.1); savePhrase(selectedWords.join(' ')); setSelectedWords([]); }} 
              style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
              SAVE 📌
            </button>
          </div>
        </div>
      )}

      {drawerId && (
        <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => { setDrawerId(null); setSelectedWords([]); }} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />
      )}
    </section>
  );
                         }
              
