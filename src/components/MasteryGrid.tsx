/* src/components/MasteryGrid.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';
import { fetchSentenceSuggestions, fetchQuickTranslation, resolveApiKey, buildOfflineTranslation } from '../services/linaService';
import type { MasteryStatus, VocabWord } from '../types/mastery';

interface Props {
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  sortMode: string;
  sortDirection: 'asc' | 'desc';
  setSortMode: (mode: string) => void;
  setSortDirection: (dir: 'asc' | 'desc') => void;
}

const STATUS_RANK: Record<MasteryStatus, number> = {
  not_started: 0, introduced: 1, practicing: 2, confident: 3, mastered: 4
};

const MOVE_THRESHOLD = 8;

export default function MasteryGrid({
  onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection,
  setSortMode, setSortDirection
}: Props) {
  const { vocabulary } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerWord, setDrawerWord]       = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  const [translation, setTranslation]     = useState<string | null>(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress    = useRef(false);
  const pointerStart   = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setTranslation(null);
    setIsAutoTranslating(false);

    if (selectedWords.length === 0) { setMagneticSuggestions([]); return; }

    if (isSandboxMode) {
      setTranslation(buildOfflineTranslation(selectedWords, vocabulary));
      setMagneticSuggestions([]);
      return;
    }

    const apiKey = resolveApiKey();
    if (!apiKey) {
      setTranslation(buildOfflineTranslation(selectedWords, vocabulary));
      setMagneticSuggestions([]);
      return;
    }

    setIsAutoTranslating(true);
    let active = true;
    const timer = setTimeout(async () => {
      const uniqueWords = [...new Set(selectedWords)];
      const [transResult, suggResults] = await Promise.all([
        fetchQuickTranslation(apiKey, selectedWords.join(' ')),
        selectedWords.length >= 2
          ? fetchSentenceSuggestions(apiKey, uniqueWords)
          : Promise.resolve([]),
      ]);
      if (active) {
        setTranslation(transResult ?? buildOfflineTranslation(selectedWords, vocabulary));
        setMagneticSuggestions(suggResults);
        setIsAutoTranslating(false);
      }
    }, 900);

    return () => { active = false; clearTimeout(timer); setIsAutoTranslating(false); };
  }, [selectedWords, isSandboxMode]);

  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    pointerStart.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent, word: string) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      soundService.playBlip(523.25, 'sine', 0.05);
      setSelectedWords(prev => [...prev, word]);
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStart.current || !longPressTimer.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD) cancelLongPress();
  };

  const handlePointerUp = () => {
    pointerStart.current = null;
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  const handleCardClick = (word: VocabWord) => {
    if (isLongPress.current) { isLongPress.current = false; return; }
    if (selectedWords.length === 0) {
      setDrawerWord(word.word);
    } else {
      setSelectedWords(prev => [...prev, word.word]);
    }
  };

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .sort((a, b) => {
      if (sortMode === 'status') {
        const diff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        return sortDirection === 'asc' ? diff : -diff;
      }
      if (sortMode === 'length') {
        const diff = a.word.length - b.word.length;
        return sortDirection === 'asc' ? diff : -diff;
      }
      const valA = a.word.toLowerCase();
      const valB = b.word.toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <div
      className="mastery-grid-container"
      style={{ paddingBottom: selectedWords.length > 0 ? '240px' : undefined }}
      onClick={() => { if (selectedWords.length > 0) setSelectedWords([]); }}
    >
      <div className="grid-toolbar">
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select">
          <option value="alphabetical">A → Z</option>
          <option value="status">Mastery Level</option>
          <option value="length">Word Length</option>
        </select>
        <button
          onClick={(e) => { e.stopPropagation(); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}
          className="btn-toggle"
          style={{ flex: 'none', width: '42px' }}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <div className="mastery-grid__cards">
        {displayed.map((word) => {
          const positions: number[] = [];
          selectedWords.forEach((w, i) => { if (w === word.word) positions.push(i + 1); });
          const isSelected = positions.length > 0;

          return (
            <div
              key={word.word}
              onPointerDown={(e) => handlePointerDown(e, word.word)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={cancelLongPress}
              onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              className="grid-item-wrapper"
              style={{
                position:   'relative',
                opacity:    selectedWords.length > 0 && !isSelected ? 0.3 : 1,
                touchAction: 'pan-y',
                cursor:     'pointer',
              }}
            >
              <VocabCard word={word} />

              {positions.length > 0 && (
                <div style={{
                  position: 'absolute', top: 3, right: 3,
                  display: 'flex', flexWrap: 'wrap', gap: '2px',
                  justifyContent: 'flex-end', maxWidth: '64px', pointerEvents: 'none',
                }}>
                  {positions.map(pos => (
                    <span
                      key={pos}
                      style={{
                        background: '#3b82f6', color: 'white', borderRadius: '50%',
                        width: '16px', height: '16px', fontSize: '0.58rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      }}
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel" onClick={(e) => e.stopPropagation()}>
          <div className="builder-content">
            <div style={{
              minHeight: '20px', color: isAutoTranslating ? '#444' : '#64748b',
              fontSize: '0.78rem', fontStyle: 'italic', marginBottom: '8px', letterSpacing: '0.01em',
            }}>
              {isAutoTranslating ? '· · ·' : (translation ?? '')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
              <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold', flex: 1, wordBreak: 'break-word' }}>
                {selectedWords.join(' ')}
              </div>
              <button
                onClick={() => setSelectedWords(prev => prev.slice(0, -1))}
                className="btn-toggle"
                style={{ flex: 'none', width: '34px', height: '34px', padding: 0, fontSize: '0.9rem' }}
                title="Remove last word"
              >⌫</button>
            </div>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { onAskLina(`Let's work on: "${selectedWords.join(' ')}" — is this correct Toki Pona?`); setSelectedWords([]); }}
                className="btn-review"
                style={{ margin: 0, fontSize: '0.72rem', padding: '10px 4px' }}
              >
                ASK LINA
              </button>
              <button
                onClick={() => setSelectedWords([])}
                className="btn-review"
                style={{ margin: 0, fontSize: '0.72rem', padding: '10px 4px', background: '#374151' }}
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>
      )}

      <WordDetailDrawer
        isOpen={!!drawerWord}
        word={drawerWord ? vocabulary.find(v => v.word === drawerWord) ?? null : null}
        onClose={() => setDrawerWord(null)}
        onAskLina={onAskLina}
        isSandboxMode={isSandboxMode}
      />
    </div>
  );
}
