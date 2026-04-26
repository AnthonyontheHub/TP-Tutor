/* src/components/MasteryGrid.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery';

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

export default function MasteryGrid({
  onAskLina, isSandboxMode, activeFilter, sortMode, sortDirection, posFilter,
  setSortMode, setSortDirection, setPosFilter
}: Props) {
  const { vocabulary, selectedWords, toggleWordSelection, setSelectedWords, lessonFilter } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.length === 0) {
      setDrawerId(word.id);
    } else {
      toggleWordSelection(word.word);
    }
  };

  const handleCardLongPress = (word: VocabWord) => {
    toggleWordSelection(word.word);
  };

  const displayed = vocabulary
    .filter(w => {
      const passesLesson = !lessonFilter || lessonFilter.includes(w.id) || lessonFilter.includes(w.word);
      const passesPos = posFilter === 'All' || w.partOfSpeech.toLowerCase() === posFilter.toLowerCase();
      return passesLesson && passesPos;
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

  return (
    <div
      className="mastery-grid-container"
      style={{ 
        paddingBottom: selectedWords.length > 0 ? '280px' : undefined,
        touchAction: 'pan-y' 
      }}
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

      <div className="mastery-grid__cards" style={{ pointerEvents: 'auto' }}>
        {displayed.map((word) => {
          const positions: number[] = [];
          selectedWords.forEach((w, i) => { if (w === word.word) positions.push(i + 1); });
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
                touchAction: 'pan-y'
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
