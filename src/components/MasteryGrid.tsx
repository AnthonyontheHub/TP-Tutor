/* src/components/MasteryGrid.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import { fetchSentenceSuggestions, fetchQuickTranslation, resolveApiKey, buildOfflineTranslation, stringifyUserContext } from '../services/linaService';
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

export default function MasteryGrid({
  onAskLina, onSaved, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter,
  setSortMode, setSortDirection, setPosFilter
}: Props) {
  const { vocabulary, savePhrase, profile, lore } = useMasteryStore();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [magneticSuggestions, setMagneticSuggestions] = useState<string[]>([]);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [savedConfirm, setSavedConfirm] = useState(false);

  const confirmTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTranslation(null);
    setIsAutoTranslating(false);
    if (confirmTimer.current) { clearTimeout(confirmTimer.current); confirmTimer.current = null; }
    setSavedConfirm(false);

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
      const userContext = stringifyUserContext(profile, lore);
      const [transResult, suggResults] = await Promise.all([
        fetchQuickTranslation(apiKey, selectedWords.join(' ')),
        selectedWords.length >= 2
          ? fetchSentenceSuggestions(apiKey, uniqueWords, userContext)
          : Promise.resolve([]),
      ]);
      if (active) {
        setTranslation(transResult ?? buildOfflineTranslation(selectedWords, vocabulary));
        setMagneticSuggestions(suggResults);
        setIsAutoTranslating(false);
      }
    }, 900);

    return () => { active = false; clearTimeout(timer); setIsAutoTranslating(false); };
  }, [selectedWords, isSandboxMode, profile, lore, vocabulary]);

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.length === 0) {
      setDrawerId(word.id);
    } else {
      setSelectedWords(prev => [...prev, word.word]);
    }
  };

  const handleCardLongPress = (word: VocabWord) => {
    if (selectedWords.length > 0) {
      setSelectedWords(prev => [...prev, word.word]);
    } else {
      setDrawerId(word.id);
    }
  };

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

  const displayed = vocabulary
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
      if (sortMode === 'useCount') {
        const diff = (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999);
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
          <option value="partOfSpeech">Part of Speech</option>
          <option value="useCount">Most Used</option>
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
          const isFilterDimmed = activeFilter && word.status !== activeFilter;

          return (
            <div
              key={word.id}
              className="grid-item-wrapper"
              style={{
                position: 'relative',
                opacity: (selectedWords.length > 0 && !isSelected) || isFilterDimmed ? 0.3 : 1,
                cursor: 'pointer',
                transition: 'opacity 0.25s ease',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <VocabCard 
                word={word} 
                onClick={handleCardClick}
                onLongPress={handleCardLongPress}
              />

              {positions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2px',
                  justifyContent: 'flex-end',
                  maxWidth: '64px',
                  pointerEvents: 'none',
                }}>
                  {positions.map(pos => (
                    <span
                      key={pos}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
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
              minHeight: '20px',
              color: isAutoTranslating ? '#444' : '#64748b',
              fontSize: '0.78rem',
              fontStyle: 'italic',
              marginBottom: '12px',
              letterSpacing: '0.01em',
            }}>
              {isAutoTranslating ? '· · ·' : (translation ?? '')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px', gap: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                {selectedWords.map((w, idx) => {
                  const vocab = vocabulary.find(v => v.word === w);
                  const meaning = vocab?.meanings?.split(',')[0].trim() || '';
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>{meaning}</div>
                      <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{w}</div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setSelectedWords(prev => prev.slice(0, -1))}
                className="btn-toggle"
                style={{ flex: 'none', width: '34px', height: '34px', padding: 0, fontSize: '0.9rem', marginBottom: '4px' }}
                title="Remove last word"
              >⌫</button>
            </div>

            {magneticSuggestions.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { onAskLina(`toki jan Lina! Let's work on: "${selectedWords.join(' ')}" — is this correct Toki Pona?`); setSelectedWords([]); }}
                className="btn-review"
                style={{ margin: 0, fontSize: '0.72rem', padding: '10px 4px' }}
              >
                ASK JAN LINA
              </button>
              <button
                onClick={() => setSelectedWords([])}
                className="btn-review"
                style={{ margin: 0, fontSize: '0.72rem', padding: '10px 4px', background: '#374151' }}
              >
                CLEAR
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
