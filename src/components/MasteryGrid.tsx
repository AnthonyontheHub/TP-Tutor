/* src/components/MasteryGrid.tsx */
import { useState, useMemo, memo, useCallback } from 'react';
import * as RWModule from 'react-window';
const List: any = (RWModule as any).FixedSizeList || (RWModule as any).default?.FixedSizeList || (RWModule as any).default || RWModule;
import * as ASModule from 'react-virtualized-auto-sizer';
const AutoSizer: any = (ASModule as any).AutoSizer || (ASModule as any).default?.AutoSizer || (ASModule as any).default || ASModule;
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery';
import { STATUS_META } from '../types/mastery';
import { WORD_RELATIONSHIPS } from '../data/wordRelationships';

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
  not_started: 0, introduced: 1, practicing: 2, confident: 3, mastered: 4
};

// Memoized Row component to prevent unnecessary re-renders
const Row = memo(({ index, style, data }: any) => {
  const { 
    items, columnCount, gap, selectedWords, activeFilter, 
    relatedWordIds, isSandboxMode, handleCardClick, handleCardLongPress,
    itemWidth
  } = data;
  
  const startIndex = index * columnCount;
  const rowItems = items.slice(startIndex, startIndex + columnCount);

  return (
    <div style={{ 
      ...style, 
      display: 'flex', 
      gap: `${gap}px`, 
      paddingRight: `${gap}px`,
      boxSizing: 'border-box',
      height: (style.height as number) - gap
    }}>
      {rowItems.map((word: VocabWord) => {
        const positions: number[] = [];
        selectedWords.forEach((w: string, i: number) => { if (w === word.word) positions.push(i + 1); });
        const isFilterDimmed = activeFilter && word.status !== activeFilter;
        const isRelated = relatedWordIds.has(word.word.toLowerCase());
        const isSelected = positions.length > 0;

        let isSelectionDimmed = false;
        if (selectedWords.length > 0) {
          if (!isSelected && !isRelated) {
            isSelectionDimmed = true;
          }
        }

        return (
          <div
            key={word.id}
            className="grid-item-wrapper"
            style={{
              position: 'relative',
              cursor: 'pointer',
              animation: isRelated ? 'relatedPulse 1.2s ease-in-out infinite' : 'none',
              touchAction: 'pan-y',
              width: itemWidth,
              flex: '0 0 auto',
              height: '100%',
              boxSizing: 'border-box'
            }}
            onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
          >
            <VocabCard 
              word={word} 
              onClick={handleCardClick}
              onLongPress={handleCardLongPress}
              isSandboxMode={isSandboxMode}
              isDimmed={isFilterDimmed || isSelectionDimmed}
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
  );
});

export default function MasteryGrid({
  onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter,
  setSortMode, setSortDirection, setPosFilter
}: Props) {
  const { vocabulary, selectedWords, toggleWordSelection, setSelectedWords, lessonFilter } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [selectedPOS, setSelectedPOS] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const handleCardClick = useCallback((word: VocabWord) => {
    if (selectedWords.length === 0) {
      setDrawerId(word.id);
    } else {
      toggleWordSelection(word.word);
    }
  }, [selectedWords, toggleWordSelection]);

  const handleCardLongPress = useCallback((word: VocabWord) => {
    toggleWordSelection(word.word);
  }, [toggleWordSelection]);

  const relatedWordIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedWords.length === 1) {
      const w = selectedWords[0].toLowerCase();
      if (WORD_RELATIONSHIPS[w]) {
        WORD_RELATIONSHIPS[w].forEach(r => ids.add(r));
      }
    }
    return ids;
  }, [selectedWords]);

  const displayed = useMemo(() => {
    return vocabulary
      .filter(item => {
        const passesLesson = !lessonFilter || lessonFilter.includes(item.id) || lessonFilter.includes(item.word);
        const matchesPOS = selectedPOS === 'All' || item.partOfSpeech === selectedPOS;
        
        let matchesSearch = true;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          matchesSearch = 
            item.word.toLowerCase().includes(q) ||
            item.meanings.toLowerCase().includes(q) ||
            item.partOfSpeech.toLowerCase().includes(q) ||
            (item.sessionNotes && item.sessionNotes.toLowerCase().includes(q));
        }

        return passesLesson && matchesPOS && matchesSearch;
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
  }, [vocabulary, lessonFilter, selectedPOS, searchQuery, sortMode, sortDirection]);

  const itemData = useMemo(() => {
     return {
        items: displayed,
        // Wait, columnCount depends on width which comes from AutoSizer
        // I will pass handleCardClick/LongPress here though
        selectedWords,
        activeFilter,
        relatedWordIds,
        isSandboxMode,
        handleCardClick,
        handleCardLongPress
     };
  }, [displayed, selectedWords, activeFilter, relatedWordIds, isSandboxMode, handleCardClick, handleCardLongPress]);

  return (
    <div
      className="mastery-grid-container"
      style={{ 
        paddingBottom: selectedWords.length > 0 ? '280px' : undefined,
        touchAction: 'pan-y',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 250px)',
        minHeight: '400px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget && selectedWords.length > 0) setSelectedWords([]); }}
    >
      <style>{`
        @keyframes relatedPulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
      <div className="grid-toolbar" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-4 mb-6">
          <select 
            value={selectedPOS} 
            onChange={(e) => setSelectedPOS(e.target.value)}
            style={{ background: '#111', border: '1px solid #222', borderRadius: '10px', color: 'white', padding: '8px' }}
          >
            <option value="All">All Parts of Speech</option>
            <option value="Noun">Nouns</option>
            <option value="Verb">Verbs</option>
            <option value="Adjective">Adjectives</option>
            <option value="Particle">Particles</option>
            <option value="Preposition">Prepositions</option>
            <option value="Pronoun">Pronouns</option>
            <option value="Number">Numbers</option>
          </select>
          <input
            type="text"
            placeholder="Search vocab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '10px',
              color: 'white',
              padding: '8px 12px',
              minWidth: '200px'
            }}
          />
        </div>
        <select 
          value={sortMode} 
          onChange={(e) => setSortMode(e.target.value)} 
          className="sort-select"
          style={{ background: '#111', border: '1px solid #222', borderRadius: '10px', color: 'white', padding: '8px' }}
        >
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
        <button
          onClick={() => setViewMode(prev => prev === 'card' ? 'table' : 'card')}
          className="btn-toggle"
          style={{ flex: 'none', width: '42px', fontSize: '1rem' }}
          title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
        >
          {viewMode === 'card' ? '📋' : '🎴'}
        </button>
      </div>

      {viewMode === 'card' ? (
        <div style={{ position: 'relative', flex: 1, pointerEvents: 'auto', width: '100%' }}>
          <AutoSizer>
            {({ height, width }: any) => {
              const gap = 10;
              const minColWidth = 100;
              const columnCount = Math.max(1, Math.floor((width + gap) / (minColWidth + gap)));
              const rowCount = Math.ceil(displayed.length / columnCount);
              const rowHeight = 115; 

              if (!height || !width) return null;

              const combinedData = {
                ...itemData,
                columnCount,
                gap,
                itemWidth
              };

              return (
                <List
                  height={height}
                  itemCount={rowCount}
                  itemSize={rowHeight}
                  width={width}
                  itemData={combinedData}
                  overscanCount={3}
                  style={{ WebkitOverflowScrolling: 'touch', overflowX: 'hidden' }}
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
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
