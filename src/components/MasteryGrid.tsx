import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  sortMode: 'alphabetical' | 'status' | 'unlocked' | 'frequency';
  sortDirection: 'asc' | 'desc';
  posFilter: string; // NEW PROP
}

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];

const FREQUENCY_ORDER = [
  "mi", "li", "e", "toki", "pona", "ni", "a", "la", "ala", "sina", "lon", "jan", "tawa", "pi", "sona", "tenpo", "ona", "wile", "mute", "taso", "o", "kama", "ken", "pilin", "nimi", "ike", "lili", "tan", "tomo", "pali", "ma", "sitelen", "kepeken", "musi", "jo", "moku", "lukin", "sama", "telo", "lape", "seme", "kin", "ilo", "ale / ali", "pini", "ante", "suli", "ijo", "anu", "nasa", "kulupu", "suno", "pana", "kalama", "lipu", "tu", "nasin", "sin", "pakala", "en", "wawa", "olin", "lawa", "awen", "sewi", "seli", "kon", "soweli", "weka", "mu", "wan", "lete", "sike", "nanpa", "kasi", "moli", "kute", "suwi", "utala", "pimeja", "mama", "sijelo", "pan", "luka", "uta", "open", "ko", "jaki", "kala", "pu", "insa", "esun", "kili", "poka", "mani", "len", "linja", "meli", "kiwen", "poki", "supa", "kule", "mije", "waso", "walo", "pipi", "palisa", "anpa", "noka", "akesi", "loje", "mun", "nena", "unpa", "sinpin", "selo", "monsi", "jelo", "laso", "oko", "alasa", "kipisi", "tonsi", "namako"
];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const savePhrase = useMasteryStore((s) => s.savePhrase);
  
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const comboRef = useRef<{ timer: ReturnType<typeof setTimeout>, wordId: string } | null>(null);

  const displayedVocab = [...vocabulary]
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      let comparison = 0;
      if (sortMode === 'status') {
        comparison = STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      } else if (sortMode === 'unlocked') {
        comparison = (b.status === 'not_started' ? 1 : 0) - (a.status === 'not_started' ? 1 : 0);
      } else if (sortMode === 'frequency') {
        const rankA = FREQUENCY_ORDER.indexOf(a.word) === -1 ? 999 : FREQUENCY_ORDER.indexOf(a.word);
        const rankB = FREQUENCY_ORDER.indexOf(b.word) === -1 ? 999 : FREQUENCY_ORDER.indexOf(b.word);
        comparison = rankA - rankB;
      } else {
        comparison = a.word.localeCompare(b.word);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.includes(word.word)) {
      if (selectedWords.length === 1) setDrawerId(word.id);
      setSelectedWords(prev => prev.filter(w => w !== word.word));
      return;
    }
    
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    }

    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { 
      timer: setTimeout(() => { 
        setSelectedWords(prev => [...prev, word.word]); 
        comboRef.current = null; 
      }, 350), 
      wordId: word.id 
    };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])} style={{ paddingBottom: selectedWords.length > 1 ? '160px' : '20px' }}>
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
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', background: '#111', border: '1px solid #3b82f6', borderRadius: '16px', padding: '16px', zIndex: 1000 }}>
          <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>{selectedWords.join(' ')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
            <button 
              onClick={() => { onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" a good sentence?`); setSelectedWords([]); }} 
              style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ASK LINA
            </button>
            <button 
              onClick={() => { savePhrase(selectedWords.join(' ')); setSelectedWords([]); }} 
              style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
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
