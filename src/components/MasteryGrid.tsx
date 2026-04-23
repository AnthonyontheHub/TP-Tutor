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
  setSortMode, setSortDirection, setPosFilter 
}: Props) {
  const { vocabulary, savePhrase } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [savedConfirm, setSavedConfirm] = useState(false);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    setTranslation(null);
    setSavedConfirm(false);
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (selectedWords.length > 1 && apiKey) {
      const timer = setTimeout(async () => {
        const results = await fetchSentenceSuggestions(apiKey, selectedWords);
        setMagneticSuggestions(results);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setMagneticSuggestions([]);
    }
  }, [selectedWords]);

  const handleTranslate = async () => {
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (!apiKey) { alert('Add your Gemini API key in Settings first.'); return; }
    setIsTranslating(true);
    const result = await fetchQuickTranslation(apiKey, selectedWords.join(' '));
    setTranslation(result);
    setIsTranslating(false);
  };

  const handleSave = () => {
    const sentence = selectedWords.join(' ');
    savePhrase({ id: sentence, tp: sentence, en: translation ?? '', notes: '' });
    setSavedConfirm(true);
    setTimeout(() => setSavedConfirm(false), 2000);
  };

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

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.includes(posFilter))
    .sort((a, b) => {
      if (sortMode === 'status') {
        const diff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        return sortDirection === 'asc' ? diff : -diff;
      }
      // Fixed: Explicitly typed the field key to resolve TypeScript indexing errors
      const field = (sortMode === 'alphabetical' ? 'word' : sortMode) as keyof typeof a;
      const valA = String(a[field] || '').toLowerCase();
      const valB = String(b[field] || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPress.current = false;
  };

  return (
    <div className="mastery-grid-container" style={{ paddingBottom: selectedWords.length > 0 ? '200px' : undefined }}>
      <div className="grid-toolbar">
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select">
          <option value="alphabetical">A-Z</option>
          <option value="status">Mastery</option>
        </select>
        <button onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="btn-toggle" style={{ flex: 'none', width: '42px' }}>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <div className="mastery-grid__cards">
        {displayed.map((word) => (
          <div
            key={word.id}
            onPointerDown={() => handlePointerDown(word.word)}
            onPointerUp={() => handlePointerUp(word.word)}
            onPointerCancel={cancelLongPress}
            onPointerLeave={cancelLongPress}
            className="grid-item-wrapper"
            style={{
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              touchAction: 'manipulation',
              cursor: 'pointer',
            }}
          >
            <VocabCard word={word} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel">
          <div className="builder-content">
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {selectedWords.join(' ')}
              </div>
              <button onClick={() => setSelectedWords([])} className="btn-toggle" style={{ flex: 'none', width: '34px', height: '34px', padding: 0, fontSize: '0.9rem' }}>✕</button>
            </div>

            {/* Translation result */}
            {translation && (
              <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                {translation}
              </div>
            )}

            {/* AI sentence suggestions */}
            {magneticSuggestions.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {magneticSuggestions.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-pill"
                    onClick={() => { onAskLina(`Let's practice this: "${s}"`); setSelectedWords([]); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="btn-review"
                style={{ margin: 0, fontSize: '0.72rem', padding: '10px 4px', opacity: isTranslating ? 0.6 : 1 }}
              >
                {isTranslating ? '...' : 'TRANSLATE'}
              </button>
              <button
                onClick={() => { onAskLina(`Let's work on: "${selectedWords.join(' ')}" — is this correct Toki Pona?`); setSelectedWords([]); }}
                className="btn-review"
                style={{ margin: 0, fontSize: '0.72rem', padding: '10px 4px' }}
              >
                ASK LINA
              </button>
              <button
                onClick={handleSave}
                className="btn-review"
                style={{ margin: 0, fontSize: '0.72rem', padding: '10px 4px', background: savedConfirm ? '#10b981' : undefined }}
              >
                {savedConfirm ? 'SAVED ✓' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}

      <WordDetailDrawer
        isOpen={!!drawerId}
        word={drawerId ? vocabulary.find(v => v.id === drawerId) ?? null : null}
        onClose={() => setDrawerId(null)}
        onAskLina={onAskLina}
        isSandboxMode={isSandboxMode}
      />
    </div>
  );
}
