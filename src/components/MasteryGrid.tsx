/* src/components/MasteryGrid.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import SentenceBuilder from './SentenceBuilder';
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
      if (selectedWords.includes(word.word)) {
        const firstIndex = selectedWords.indexOf(word.word);
        if (firstIndex !== -1) {
          const newSelected = [...selectedWords];
          newSelected.splice(firstIndex, 1);
          setSelectedWords(newSelected);
        }
      } else {
        setSelectedWords(prev => [...prev, word.word]);
      }
    }
  };

  const handleCardLongPress = (word: VocabWord) => {
    if (selectedWords.length === 0) {
      setSelectedWords([word.word]);
    } else {
      setSelectedWords(prev => [...prev, word.word]);
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
      style={{ paddingBottom: selectedWords.length > 0 ? '280px' : undefined }}
      onClick={(e) => { if (e.target === e.currentTarget && selectedWords.length > 0) setSelectedWords([]); }}
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
                opacity: isFilterDimmed ? 0.3 : 1,
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
                  top: -6,
                  right: -6,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2px',
                  justifyContent: 'flex-end',
                  maxWidth: '64px',
                  pointerEvents: 'none',
                  zIndex: 10
                }}>
                  {positions.map(pos => (
                    <span
                      key={pos}
                      style={{
                        background: 'var(--gold)',
                        color: 'black',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        border: '1px solid black'
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

      <SentenceBuilder 
        selectedWords={selectedWords}
        vocabulary={vocabulary}
        translation={translation}
        isAutoTranslating={isAutoTranslating}
        onClear={() => setSelectedWords([])}
        onSave={handleSave}
        onPractice={(s) => { onAskLina(`toki jan Lina! Let's practice this: "${s}"`); setSelectedWords([]); }}
        onExplain={(s) => { onAskLina(`toki jan Lina! Can you explain the grammar of this phrase: "${s}"?`); setSelectedWords([]); }}
        onRemoveLast={() => setSelectedWords(prev => prev.slice(0, -1))}
      />

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
