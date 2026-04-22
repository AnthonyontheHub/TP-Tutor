/* src/components/MasteryGrid.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';
import { fetchSentenceSuggestions, fetchQuickTranslation } from '../services/linaService';
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
  onNavigateToPhrases?: (id?: string) => void;
}

const STATUS_RANK: Record<MasteryStatus, number> = {
  not_started: 0,
  introduced: 1,
  practicing: 2,
  confident: 3,
  mastered: 4
};

export default function MasteryGrid({ 
  onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter, 
  setSortMode, setSortDirection, setPosFilter, onNavigateToPhrases
}: Props) {
  const { vocabulary, savePhrase } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  
  const [activePillMenu, setActivePillMenu] = useState<string | null>(null);
  const [translationText, setTranslationText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (selectedWords.length > 1) {
      if (apiKey && !isSandboxMode) {
        const timer = setTimeout(async () => {
          const results = await fetchSentenceSuggestions(apiKey, selectedWords);
          setMagneticSuggestions(results);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        const baseCombo = selectedWords.join(' ');
        const combos = [baseCombo];
        if (selectedWords.length === 2 && !selectedWords.includes('li')) {
          combos.push(`${selectedWords[0]} li ${selectedWords[1]}`);
        } else if (selectedWords.length >= 3 && !selectedWords.includes('li')) {
          combos.push(`${selectedWords[0]} li ${selectedWords.slice(1).join(' ')}`);
          combos.push(`${selectedWords[0]} ${selectedWords[1]} li ${selectedWords.slice(2).join(' ')}`);
        }
        setMagneticSuggestions(Array.from(new Set(combos)));
      }
    } else {
      setMagneticSuggestions([]);
      setActivePillMenu(null);
      setTranslationText(null);
      setIsTranslating(false);
    }
  }, [selectedWords, isSandboxMode]);

  const handlePointerDown = (word: string) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      soundService.playBlip(523.25, 'sine', 0.05);
      setSelectedWords(prev => prev.includes(word) ? prev : [...prev, word]);
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

  // Fixed Translation Toggle
  const handleTranslateToggle = async () => {
    if (isTranslating) {
      setIsTranslating(false);
      return;
    }
    
    setIsTranslating(true);
    
    if (!translationText) {
      const phrase = selectedWords.join(' ');
      const apiKey = localStorage.getItem('TP_GEMINI_KEY');
      
      setTranslationText("..."); 

      if (apiKey && !isSandboxMode) {
        const result = await fetchQuickTranslation(apiKey, phrase);
        if (result) {
          setTranslationText(result);
          return;
        }
      }
      
      const fallbackTranslation = selectedWords.map(w => {
        const match = vocabulary.find(v => v.word === w);
        return match ? match.meanings.split(',')[0].trim() : w;
      }).join(' ');
      
      setTranslationText(fallbackTranslation);
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      if (sortMode === 'status') {
        const diff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        return sortDirection === 'asc' ? diff : -diff;
      }
      const field = sortMode === 'alphabetical' ? 'word' : (sortMode as keyof typeof a);
      const valA = String(a[field] || '').toLowerCase();
      const valB = String(b[field] || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <div className="mastery-grid-container">
      <div className="grid-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select">
          <option value="alphabetical">A-Z</option>
          <option value="status">Mastery Level</option>
          <option value="partOfSpeech">Word Type (POS)</option>
          <option value="meanings">English Meaning</option>
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
            className="grid-item-wrapper"
            style={{ 
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              touchAction: 'none',
              cursor: 'pointer'
            }}
          >
            <VocabCard word={word} onClick={() => {}} />
          </div>
        ))}
      </div>

      {selectedWords.length > 1 && (
        <div className="builder-panel">
          <div className="builder-content">
            
            {magneticSuggestions.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px', justifyContent: 'center' }}>
                {magneticSuggestions.map((s, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <button 
                      className="suggestion-pill"
                      onClick={() => setActivePillMenu(activePillMenu === s ? null : s)}
                      style={{ borderColor: activePillMenu === s ? '#fff' : '#3b82f6' }}
                    >
                      {s}
                    </button>
                    
                    {activePillMenu === s && (
                      <div style={{ 
                        position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', 
                        background: '#222', padding: '6px', borderRadius: '8px', display: 'flex', gap: '6px', 
                        border: '1px solid #444', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}>
                        <button 
                          className="btn-toggle" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem', margin: 0 }}
                          onClick={() => { onAskLina(`Let's practice this: "${s}"`); setActivePillMenu(null); }}
                        >
                          ASK
                        </button>
                        <button 
                          className="btn-toggle" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem', margin: 0, background: '#16a34a' }}
                          onClick={() => { 
                            const newId = crypto.randomUUID();
                            savePhrase({ id: newId, tp: s, en: 'User Saved Phrase *', notes: '' }); 
                            setActivePillMenu(null);
                            if (onNavigateToPhrases) onNavigateToPhrases(newId);
                          }}
                        >
                          SAVE
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ color: isTranslating ? '#a855f7' : 'white', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center', minHeight: '1.5rem' }}>
                {isTranslating ? translationText : selectedWords.join(' ')}
              </div>
              <button 
                onClick={handleTranslateToggle}
                style={{ 
                  background: isTranslating ? '#333' : 'none', 
                  border: isTranslating ? '2px solid #a855f7' : '2px solid #555', 
                  borderRadius: '50%', width: '28px', height: '28px', 
                  color: isTranslating ? '#a855f7' : '#999', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', touchAction: 'none'
                }}
              >
                ?
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { onAskLina(`Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} 
                className="btn-review" 
                style={{ margin: 0, flex: 2 }}
              >
                ASK LINA
              </button>
              <button 
                onClick={() => { setSelectedWords([]); setActivePillMenu(null); }} 
                className="btn-toggle"
                style={{ flex: 1 }}
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>
      )}

      {drawerId && (
        <WordDetailDrawer 
          word={vocabulary.find(v => v.id === drawerId)!} 
          onClose={() => setDrawerId(null)} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode} 
        />
      )}
    </div>
  );
}
