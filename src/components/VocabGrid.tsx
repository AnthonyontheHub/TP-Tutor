/* src/components/VocabGrid.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { VocabWord } from '../types/mastery';

interface Props {
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  filterIds?: string[];
  hideToolbar?: boolean;
}

export default function VocabGrid({
  onAskLina, isSandboxMode, filterIds, hideToolbar = false
}: Props) {
  const { vocabulary, selectedWords, addWordToSelection, removeWordFromSelection, setSelectedWords } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.length === 0) {
      setDrawerId(word.id);
    } else {
      if (selectedWords.includes(word.word)) {
        removeWordFromSelection(word.word);
      } else {
        addWordToSelection(word.word);
      }
    }
  };

  const handleCardLongPress = (word: VocabWord) => {
    addWordToSelection(word.word);
  };

  const displayed = vocabulary
    .filter(w => {
      if (!filterIds) return true;
      return filterIds.includes(w.id) || filterIds.includes(w.word);
    })
    .sort((a, b) => a.word.localeCompare(b.word));

  return (
    <div
      className="vocab-grid-container"
      onClick={(e) => { if (e.target === e.currentTarget && selectedWords.length > 0) setSelectedWords([]); }}
    >
      {!hideToolbar && (
        <div className="grid-toolbar">
          {/* Default toolbar content if needed, but for now we keep it simple or empty */}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
        gap: '8px', 
        marginBottom: '20px' 
      }}>
        {displayed.map((word) => {
          const positions: number[] = [];
          selectedWords.forEach((w, i) => { if (w === word.word) positions.push(i + 1); });

          return (
            <div
              key={word.id}
              style={{ position: 'relative' }}
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
                  top: -4,
                  right: -4,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2px',
                  justifyContent: 'flex-end',
                  maxWidth: '40px',
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
                        width: '14px',
                        height: '14px',
                        fontSize: '0.5rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
