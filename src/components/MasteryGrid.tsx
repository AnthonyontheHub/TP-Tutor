/* src/components/MasteryGrid.tsx */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery';
import { STATUS_META } from '../types/mastery';
import { WORD_RELATIONSHIPS } from '../data/wordRelationships';
import { fetchEnglishToTokiPona, resolveApiKey } from '../services/linaService';
import InfoTooltip from './InfoTooltip';

interface Props {
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  sortMode: string;
  sortDirection: 'asc' | 'desc';
  setSortMode: (mode: string) => void;
  setSortDirection: (dir: 'asc' | 'desc') => void;
  onSavePhrase?: (tp: string, en: string) => void;
  posFilter?: string;
  setPosFilter?: (pos: string) => void;
}

const STATUS_RANK: Record<MasteryStatus, number> = {
  not_started: 0, introduced: 1, practicing: 2, confident: 3, mastered: 4
};

export default function MasteryGrid({
  onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection,
  setSortMode, setSortDirection, onSavePhrase, posFilter, setPosFilter
}: Props) {
  const { vocabulary, selectedWords, toggleWordSelection, addWordToSelection, setSelectedWords, lessonFilter, savePhrase } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [selectedPOS, setSelectedPOS] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridDensity, setGridDensity] = useState<'ledger' | 'grid' | 'crystal' | 'datapad'>('grid');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const longPressFlag = useRef(false);

  const handleWordTap = useCallback((word: VocabWord) => {
    if (longPressFlag.current) {
      longPressFlag.current = false;
      return;
    }
    if (selectedWords.length > 0) {
      toggleWordSelection(word.word);
    } else {
      setDrawerId(word.id);
    }
  }, [selectedWords, toggleWordSelection]);

  const handleLongPress = useCallback((e: React.MouseEvent | React.TouchEvent, word: VocabWord) => {
    e.preventDefault();
    toggleWordSelection(word.word);
  }, [toggleWordSelection]);

  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTouchStart = useCallback((word: VocabWord) => {
    touchTimer.current = setTimeout(() => {
      longPressFlag.current = true;
      toggleWordSelection(word.word);
    }, 600);
  }, [toggleWordSelection]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
  }, []);

  const handleMouseDown = useCallback((word: VocabWord) => {
    touchTimer.current = setTimeout(() => {
      longPressFlag.current = true;
      toggleWordSelection(word.word);
    }, 600);
  }, [toggleWordSelection]);

  const handleMouseUp = useCallback(() => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
  }, []);

  // Cycle: ledger -> grid -> crystal -> datapad -> ledger
  const cycleDensity = () => {
    setGridDensity(prev => {
      if (prev === 'ledger') return 'grid';
      if (prev === 'grid') return 'crystal';
      if (prev === 'crystal') return 'datapad';
      return 'ledger';
    });
  };

  const densityIcon = {
    ledger: '📑',
    grid: '🎴',
    crystal: '💎',
    datapad: '📟'
  }[gridDensity];

  // Helper function to parse and abbreviate part of speech
  const getPartOfSpeechAbbreviation = useCallback((partOfSpeech: string): string => {
    if (!partOfSpeech) return '';
    return partOfSpeech
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .join(', ');
  }, []);

  // 3. Polish the POS Dropdown logic
  const availablePartsOfSpeech = useMemo(() => {
    const allPOS = vocabulary
      .filter(item => item.type === 'word')
      .flatMap(item => 
        item.partOfSpeech
           .split(',')
           .map(p => p.trim())
           .filter(p => p !== '')
           .map(p => p.toLowerCase())
      );

    const uniquePOS = Array.from(new Set(allPOS));
    return uniquePOS
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .sort();
  }, [vocabulary]);

  const relatedWordIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedWords.length > 0) {
      selectedWords.forEach(word => {
        const w = word.toLowerCase();
        if (WORD_RELATIONSHIPS[w]) {
          WORD_RELATIONSHIPS[w].forEach(r => ids.add(r));
        }
      });
    }
    return ids;
  }, [selectedWords]);

  const displayed = useMemo(() => {
    return vocabulary
      .filter(item => {
        const passesLesson = !lessonFilter || lessonFilter.includes(item.id) || lessonFilter.includes(item.word);
        
        // inclusive filter check
        let matchesPOS = true;
        if (selectedPOS !== 'All' && item.partOfSpeech) {
          matchesPOS = item.partOfSpeech.toLowerCase().split(',').map(p => p.trim()).includes(selectedPOS.toLowerCase());
        } else if (selectedPOS !== 'All' && !item.partOfSpeech) {
          matchesPOS = false;
        }

        const matchesSearch = searchQuery.trim() === '' || 
          item.word.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          item.meanings.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          (item.partOfSpeech && item.partOfSpeech.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
          (item.sessionNotes && item.sessionNotes.toLowerCase().includes(searchQuery.toLowerCase().trim()));

        const matchesKu = sortMode !== 'ku' || item.isKu;

        return passesLesson && matchesPOS && matchesSearch && matchesKu;
      })
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
          const posA = a.partOfSpeech || '';
          const posB = b.partOfSpeech || '';
          const diff = posA.localeCompare(posB);
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
  }, [vocabulary, lessonFilter, selectedPOS, searchQuery, sortMode, sortDirection]);

  useEffect(() => {
    let active = true;
    const query = searchQuery.trim();

    if (displayed.length === 0 && query.length > 0 && !isSandboxMode) {
      const apiKey = resolveApiKey();
      if (!apiKey) {
        setSuggestion(null);
        return;
      }

      setIsTranslating(true);
      const timer = setTimeout(async () => {
        try {
          const result = await fetchEnglishToTokiPona(apiKey, query);
          if (active) {
            // Sanitize: Remove markdown code blocks, quotes, and newlines
            const cleanResult = result 
              ? result.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').replace(/["']/g, '').trim()
              : null;
              
            setSuggestion(cleanResult);
            setIsTranslating(false);
          }
        } catch (err) {
          console.error('jan Lina Translation Error:', err);
          if (active) setIsTranslating(false);
        }
      }, 1200);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setSuggestion(null);
      setIsTranslating(false);
    }
  }, [displayed.length, searchQuery, isSandboxMode]);

  return (
    <div
      className="mastery-grid-container"
      style={{
        paddingBottom: selectedWords.length > 0 ? '280px' : '16px',
        touchAction: 'pan-y',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && selectedWords.length > 0) setSelectedWords([]); }}
    >
      <style>{`
        @keyframes relatedPulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .mastery-vocab-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          width: 100%;
        }
        .grid-toolbar {
          margin-top: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: none;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          padding: 8px;
          margin-bottom: 0;
        }
        .toolbar-input {
          background: #111;
          border: 1px solid #333;
          border-radius: 6px;
          color: white;
          padding: 0 10px;
          height: 36px;
          font-size: 0.8rem;
          box-sizing: border-box;
        }

        /* ── Mobile: two clean rows ── */
        .grid-toolbar-inner {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .toolbar-row {
          display: flex;
          gap: 8px;
          width: 100%;
          align-items: center;
        }
        /* Row 1: POS dropdown + Search bar share the full width */
        .toolbar-row--filters .toolbar-pos-select {
          flex: 0 0 auto;
          width: 130px;
        }
        .toolbar-row--filters .toolbar-search {
          flex: 1;
          min-width: 0;
        }
        /* Row 2: Sort dropdown expands, arrow + view toggle are fixed-width icon buttons */
        .toolbar-row--sort .toolbar-sort-select {
          flex: 1;
          min-width: 0;
        }
        .toolbar-icon-btn {
          flex: 0 0 36px;
          width: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        /* ── Desktop: single row ── */
        @media (min-width: 768px) {
          .grid-toolbar-inner {
            flex-direction: row;
            align-items: center;
          }
          .toolbar-row {
            width: auto;
            flex: 1;
          }
          .toolbar-row--filters .toolbar-pos-select {
            width: 160px;
          }
        }
      `}</style>
      <div className="grid-toolbar" style={{ flexShrink: 0 }}>
        <div className="grid-toolbar-inner">

          {/* Row 1: POS filter + Search */}
          <div className="toolbar-row toolbar-row--filters">
            <select
              value={selectedPOS}
              onChange={(e) => setSelectedPOS(e.target.value)}
              className="toolbar-input toolbar-pos-select"
            >
              <option value="All">All Parts of Speech</option>
              {availablePartsOfSpeech.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search vocab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="toolbar-input toolbar-search"
            />
          </div>

          {/* Row 2: Sort + Direction + View toggle */}
          <div className="toolbar-row toolbar-row--sort">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="toolbar-input toolbar-sort-select"
            >
              <option value="alphabetical">A → Z</option>
              <option value="status">Mastery Level</option>
              <option value="length">Word Length</option>
              <option value="partOfSpeech">Part of Speech</option>
              <option value="useCount">Most Used</option>
              <option value="ku">Lipu Ku</option>
            </select>
            <button
              onClick={(e) => { e.stopPropagation(); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}
              className="toolbar-input btn-toggle toolbar-icon-btn"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
            <button
              onClick={cycleDensity}
              className="toolbar-input btn-toggle toolbar-icon-btn"
              title={`Switch density (Current: ${gridDensity})`}
            >
              {densityIcon}
            </button>
          </div>

        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px', fontSize: '0.75rem', color: '#888', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
         <span>Tap words to inspect data. Long-press to initiate Sentence Builder.</span>
         <InfoTooltip text="Tap an isolated word, or the DETAILS button inside Flashcards, to view its full dossier and history." />
      </div>

      {displayed.length === 0 && searchQuery.trim() === '' && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed #333' }}>
           {lessonFilter ? "No words found for this filter. Change your roadmap position or clear the filter." : "No vocabulary words found."}
        </div>
      )}

      {displayed.length === 0 && searchQuery.trim() !== '' && (suggestion || isTranslating) && (
        <div className="suggestion-panel" style={{
          background: 'rgba(251, 191, 36, 0.05)',
          border: '1px solid var(--gold)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800, marginBottom: '8px', opacity: 0.8 }}>
            {isTranslating ? 'jan LINA IS THINKING...' : 'NO LOCAL RESULTS. jan LINA SUGGESTS:'}
          </div>
          {suggestion ? (
            <>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '12px', color: 'white' }}>
                "{searchQuery}" → 
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {suggestion.split(/\s+/).map((word, i) => (
                  <button
                    key={i}
                    onClick={() => addWordToSelection(word.replace(/[.!?,]/g, '').toLowerCase())}
                    className="chip-btn"
                    style={{
                      background: 'rgba(255, 191, 0, 0.1)',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onSavePhrase ? onSavePhrase(suggestion, searchQuery) : savePhrase({ id: suggestion, tp: suggestion, en: searchQuery, notes: 'AI Suggestion' })}
                className="btn-review"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '0.7rem', marginBottom: 0 }}
              >
                SAVE PHRASE
              </button>
            </>
          ) : !isTranslating && (
            <div style={{ color: '#666', fontSize: '0.85rem' }}>
              jan Lina couldn't find a translation for this yet.
            </div>
          )}
        </div>
      )}

      <div 
        className={gridDensity === 'ledger' || gridDensity === 'datapad' ? 'flex flex-col gap-2' : 'mastery-vocab-grid'}
        style={{ width: '100%' }}
      >
        {displayed.map((word) => {
          const positions: number[] = [];
          selectedWords.forEach((w, i) => { if (w === word.word) positions.push(i + 1); });
          const isFilterDimmed = !!(activeFilter && word.status !== activeFilter);
          const isRelated = relatedWordIds.has(word.word.toLowerCase());
          const isSelected = positions.length > 0;
          const isSelectionDimmed = selectedWords.length > 0 && !isSelected && !isRelated;
          const isDimmed = isFilterDimmed || isSelectionDimmed;

          const selectionCounter = positions.length > 0 && (
            <div style={{
              position: 'absolute', top: -6, right: -6,
              display: 'flex', flexWrap: 'wrap', gap: '2px',
              justifyContent: 'flex-end', maxWidth: '64px',
              pointerEvents: 'none', zIndex: 10
            }}>
              {positions.map(pos => (
                <span key={pos} style={{
                  background: 'var(--gold)', color: 'black', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.5)', border: '1px solid black'
                }}>{pos}</span>
              ))}
            </div>
          );

          const STATUS_ICONS: Record<MasteryStatus, string> = {
            not_started: '⬜',
            introduced: '🔵',
            practicing: '🟡',
            confident: '🟢',
            mastered: '✦',
          };

          if (gridDensity === 'ledger') {
            return (
              <div 
                key={word.id} 
                className={`vocab-ledger-row vocab-ledger-row--${word.status} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleWordTap(word)}
                onContextMenu={(e) => e.preventDefault()} onTouchMove={handleTouchEnd}
                onTouchStart={() => handleTouchStart(word)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleMouseDown(word)}
                onMouseUp={handleMouseUp}
                style={{ opacity: isDimmed ? 0.3 : 1 }}
              >
                <div className="vocab-ledger-word">{word.word}</div>
                <div className="vocab-ledger-pos">{getPartOfSpeechAbbreviation(word.partOfSpeech)}</div>
                <div className="vocab-ledger-en">{word.meanings.split(/[;,]/)[0].trim()}</div>
                <div className="vocab-ledger-stats">
                  <span>{word.baseScore} XP</span>
                  <span>{STATUS_ICONS[word.status]}</span>
                </div>
                {selectionCounter}
              </div>
            );
          }

          if (gridDensity === 'grid') {
            return (
              <div
                key={word.id}
                className={`vocab-card vocab-card--${word.status} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleWordTap(word)}
                onContextMenu={(e) => e.preventDefault()} onTouchMove={handleTouchEnd}
                onTouchStart={() => handleTouchStart(word)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleMouseDown(word)}
                onMouseUp={handleMouseUp}
                style={{ 
                  opacity: isDimmed ? 0.3 : 1,
                  animation: isRelated ? 'relatedPulse 1.2s ease-in-out infinite' : 'none',
                }}
              >
                <div className="sitelen-watermark">{word.word}</div>
                <div className="vocab-card__word">{word.word}</div>
                <div className="vocab-card__pos">{getPartOfSpeechAbbreviation(word.partOfSpeech)}</div>
                {selectionCounter}
              </div>
            );
          }

          if (gridDensity === 'crystal') {
            return (
              <div 
                key={word.id} 
                className={`vocab-crystal-card vocab-crystal-card--${word.status} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleWordTap(word)}
                onContextMenu={(e) => e.preventDefault()} onTouchMove={handleTouchEnd}
                onTouchStart={() => handleTouchStart(word)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleMouseDown(word)}
                onMouseUp={handleMouseUp}
                style={{ opacity: isDimmed ? 0.3 : 1 }}
              >
                <div className="sitelen-watermark">{word.word}</div>
                <div className="vocab-crystal-word">{word.word}</div>
                <div className="vocab-crystal-en">{word.meanings.split(/[;,]/)[0].trim()}</div>
                {word.examples && word.examples.length > 0 && (
                  <div className="vocab-crystal-example">"{word.examples[0].tp}"</div>
                )}
                <div className="vocab-crystal-stats">{getPartOfSpeechAbbreviation(word.partOfSpeech)} | {word.baseScore} XP</div>
                {selectionCounter}
              </div>
            );
          }

          if (gridDensity === 'datapad') {
            return (
              <div 
                key={word.id} 
                className={`vocab-datapad-block vocab-datapad-block--${word.status} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleWordTap(word)}
                onContextMenu={(e) => e.preventDefault()} onTouchMove={handleTouchEnd}
                onTouchStart={() => handleTouchStart(word)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleMouseDown(word)}
                onMouseUp={handleMouseUp}
                style={{ opacity: isDimmed ? 0.3 : 1 }}
              >
                <div className="sitelen-watermark">{word.word}</div>
                
                <div className="datapad-column">
                  <div className="datapad-section-title">Concept</div>
                  <div className="datapad-word">{word.word}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    {word.partOfSpeech.split(',').map((p, pIdx) => (
                      <span key={pIdx} className={`pos-tag pos-tag--${p.toLowerCase().trim()[0]}`}>
                        {p.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="datapad-en">{word.meanings}</div>
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', fontWeight: 900, color: 'white' }}>
                    LEVEL {Math.floor(word.baseScore / 100)} • {word.baseScore} XP
                  </div>
                </div>

                <div className="datapad-column">
                  <div className="datapad-section-title">Neural Logs</div>
                  <div className="datapad-notes">
                    {word.sessionNotes || "No active session logs for this node."}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div className="datapad-meta">
                      <span>Used {word.useCount}x</span>
                      <span>{STATUS_META[word.status].label}</span>
                    </div>
                    <div style={{ fontSize: '1.2rem' }}>{STATUS_ICONS[word.status]}</div>
                  </div>
                </div>
                {selectionCounter}
              </div>
            );
          }

          return null;
        })}
      </div>

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
