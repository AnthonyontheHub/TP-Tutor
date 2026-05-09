/* src/components/MasteryGrid.tsx */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import ChallengeWidget from './ChallengeWidget';
import type { MasteryStatus, VocabWord } from '../types/mastery';
import { STATUS_META } from '../types/mastery';
import { WORD_RELATIONSHIPS } from '../data/wordRelationships';
import { fetchEnglishToTokiPona, resolveApiKey } from '../services/linaService';

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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

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

  const handleCardClick = useCallback((word: VocabWord) => {
    if (selectedWords.length > 0) {
      toggleWordSelection(word.word);
    } else {
      setDrawerId(word.id);
    }
  }, [selectedWords, toggleWordSelection]);

  const handleCardLongPress = useCallback((word: VocabWord) => {
    toggleWordSelection(word.word);
  }, [toggleWordSelection]);

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
              onClick={() => setViewMode(prev => prev === 'card' ? 'table' : 'card')}
              className="toolbar-input btn-toggle toolbar-icon-btn"
              title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
            >
              {viewMode === 'card' ? '📋' : '🎴'}
            </button>
          </div>

        </div>
      </div>

      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <ChallengeWidget />
      </div>

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

      {viewMode === 'card' ? (
        <div className="mastery-vocab-grid">
          {displayed.map((word) => {
            const positions: number[] = [];
            selectedWords.forEach((w, i) => { if (w === word.word) positions.push(i + 1); });
            const isFilterDimmed = !!(activeFilter && word.status !== activeFilter);
            const isRelated = relatedWordIds.has(word.word.toLowerCase());
            const isSelected = positions.length > 0;
            const isSelectionDimmed = selectedWords.length > 0 && !isSelected && !isRelated;

            return (
              <div
                key={word.id}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  animation: isRelated ? 'relatedPulse 1.2s ease-in-out infinite' : 'none',
                  touchAction: 'pan-y',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <VocabCard
                  word={word}
                  onClick={handleCardClick}
                  onLongPress={handleCardLongPress}
                  isSandboxMode={isSandboxMode}
                  isDimmed={isFilterDimmed || isSelectionDimmed}
                  isSelected={isSelected}
                  isRelated={isRelated}
                />
                {positions.length > 0 && (
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
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mastery-grid__table-wrapper" style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid #222' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px' }}>WORD</th>
                <th style={{ padding: '12px 16px' }}>FUNCTION</th>
                <th style={{ padding: '12px 16px' }}>MEANINGS</th>
                <th style={{ padding: '12px 16px' }}>SESSION NOTES</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((word) => {
                const isFilterDimmed = activeFilter && word.status !== activeFilter;
                const isSelected = selectedWords.includes(word.word);
                const posIndex = selectedWords.indexOf(word.word) + 1;

                return (
                  <tr 
                    key={word.id}
                    onClick={() => handleCardClick(word)}
                    onContextMenu={(e) => { e.preventDefault(); handleCardLongPress(word); }}
                    style={{ 
                      cursor: 'pointer',
                      borderBottom: '1px solid #222',
                      background: isSelected ? 'rgba(255, 191, 0, 0.1)' : 'transparent',
                      opacity: isFilterDimmed ? 0.3 : 1,
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '1.2rem' }}>
                      {STATUS_META[word.status].emoji}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 900, color: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {word.word}
                        {posIndex > 0 && (
                           <span style={{ background: 'var(--gold)', color: 'black', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{posIndex}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {word.type === 'grammar' ? 'GRAMMAR' : word.partOfSpeech}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ccc', fontWeight: 700 }}>
                      {word.meanings.split(/[;,]/)[0].trim()}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', lineHeight: '1.4' }}>
                      {word.sessionNotes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
