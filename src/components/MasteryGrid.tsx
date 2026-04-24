/* src/components/MasteryGrid.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';
import { fetchSentenceSuggestions, fetchQuickTranslation } from '../services/linaService';
import type { MasteryStatus, VocabWord } from '../types/mastery';

interface Props {
  onAskLina: (p: string) => void;
  onSaved?: (phraseId: string) => void;
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
  not_started: 0, introduced: 1, practicing: 2, confident: 3, mastered: 4
};

const MOVE_THRESHOLD = 8;

export default function MasteryGrid({
  onAskLina, onSaved, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter,
  setSortMode, setSortDirection, setPosFilter
}: Props) {
  const { vocabulary, savePhrase } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [savedConfirm, setSavedConfirm] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress   = useRef(false);
  const pointerStart  = useRef<{ x: number; y: number } | null>(null);

  // Auto-translate + suggestions whenever selected words change.
  // The `active` flag prevents stale async responses from overwriting fresh state.
  useEffect(() => {
    setTranslation(null);
    setIsAutoTranslating(false);
    if (confirmTimer.current) { clearTimeout(confirmTimer.current); confirmTimer.current = null; }
    setSavedConfirm(false);

    if (selectedWords.length === 0) {
      setMagneticSuggestions([]);
      return;
    }

    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (!apiKey) { setMagneticSuggestions([]); return; }

    setIsAutoTranslating(true);
    let active = true;
    const timer = setTimeout(async () => {
      const [transResult, suggResults] = await Promise.all([
        fetchQuickTranslation(apiKey, selectedWords.join(' ')),
        selectedWords.length >= 2
          ? fetchSentenceSuggestions(apiKey, selectedWords)
          : Promise.resolve([]),
      ]);
      if (active) {
        setTranslation(transResult ?? '(translation unavailable)');
        setMagneticSuggestions(suggResults);
        setIsAutoTranslating(false);
      }
    }, 900);

    return () => { active = false; clearTimeout(timer); setIsAutoTranslating(false); };
  }, [selectedWords]);

  // ── Pointer handlers ──────────────────────────────────────────────────────

  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    pointerStart.current = null;
    // Intentionally NOT resetting isLongPress.current — onClick needs to consume it.
  };

  const handlePointerDown = (e: React.PointerEvent, word: string) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      soundService.playBlip(523.25, 'sine', 0.05);
      setSelectedWords(prev => prev.includes(word) ? prev : [...prev, word]);
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStart.current || !longPressTimer.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD) cancelLongPress();
  };

  // Pure cleanup — tap logic lives in onClick so pointerCancel can't drop it.
  const handlePointerUp = () => {
    pointerStart.current = null;
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  // onClick is the browser's most reliable tap signal — never fires after scroll/cancel.
  const handleCardClick = (word: VocabWord) => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    if (selectedWords.length === 0) {
      setDrawerId(word.id);
    } else {
      setSelectedWords(prev =>
        prev.includes(word.word) ? prev.filter(w => w !== word.word) : [...prev, word.word]
      );
    }
  };

  // ── Builder actions ───────────────────────────────────────────────────────

  const handleSave = () => {
    const sentence = selectedWords.join(' ');
    savePhrase({ id: sentence, tp: sentence, en: translation ?? '', notes: '' });
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setSavedConfirm(true);
    confirmTimer.current = setTimeout(() => {
      setSavedConfirm(false);
      confirmTimer.current = null;
      setSelectedWords([]);
      onSaved?.(sentence);
    }, 800);
  };

  // ── Display list ──────────────────────────────────────────────────────────

  const displayed = vocabulary
    .filter(w => !activeFilter || w.status === activeFilter)
    .filter(w => posFilter === 'All' || w.partOfSpeech.toLowerCase().includes(posFilter.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === 'status') {
        const diff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        return sortDirection === 'asc' ? diff : -diff;
      }
      if (sortMode === 'length') {
        const diff = a.word.length - b.word.length;
        return sortDirection === 'asc' ? diff : -diff;
      }
      if (sortMode === 'partOfSpeech') {
        const diff = a.partOfSpeech.localeCompare(b.partOfSpeech);
        return sortDirection === 'asc' ? diff : -diff;
      }
      // Default: alphabetical by word
      const valA = a.word.toLowerCase();
      const valB = b.word.toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    // Container onClick clears multi-select when tapping empty grid space.
    // Each card stops propagation so container onClick doesn't fire on card taps.
    <div
      className="mastery-grid-container"
      style={{ paddingBottom: selectedWords.length > 0 ? '220px' : undefined }}
      onClick={() => { if (selectedWords.length > 0) setSelectedWords([]); }}
    >
      <div className="grid-toolbar">
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="sort-select">
          <option value="alphabetical">A → Z</option>
          <option value="status">Mastery Level</option>
          <option value="length">Word Length</option>
          <option value="partOfSpeech">Part of Speech</option>
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
        {displayed.map((word) => (
          <div
            key={word.id}
            onPointerDown={(e) => handlePointerDown(e, word.word)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={cancelLongPress}
            onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
            className="grid-item-wrapper"
            style={{
              opacity: selectedWords.length > 0 && !selectedWords.includes(word.word) ? 0.3 : 1,
              touchAction: 'pan-y',
              cursor: 'pointer',
            }}
          >
            <VocabCard word={word} />
          </div>
        ))}
      </div>

      {selectedWords.length > 0 && (
        <div className="builder-panel" onClick={(e) => e.stopPropagation()}>
          <div className="builder-content">
            {/* Auto-translation above the phrase */}
            <div style={{
              minHeight: '22px',
              color: isAutoTranslating ? '#555' : '#64748b',
              fontSize: '0.8rem',
              fontStyle: 'italic',
              marginBottom: '6px',
            }}>
              {isAutoTranslating ? '...' : (translation ?? '')}
            </div>

            {/* Sentence + dismiss */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {selectedWords.join(' ')}
              </div>
              <button
                onClick={() => setSelectedWords([])}
                className="btn-toggle"
                style={{ flex: 'none', width: '34px', height: '34px', padding: 0, fontSize: '0.9rem' }}
              >✕</button>
            </div>

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

            {/* Action row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
