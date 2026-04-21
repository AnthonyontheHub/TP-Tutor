import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus } from '../types/mastery'; // NEW IMPORT

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null; // NEW PROP
}

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter the vocabulary before mapping it out!
  const displayedVocab = activeFilter 
    ? vocabulary.filter(w => w.status === activeFilter)
    : vocabulary;

  const selectedWord = selectedId
    ? (vocabulary.find((w) => w.id === selectedId) ?? null)
    : null;

  return (
    <section className="mastery-grid">
      <h2 className="section-title">
        VOCABULARY{' '}
        <span className="section-title__count">
          — SHOWING {displayedVocab.length} {activeFilter ? 'FILTERED' : 'TOTAL'}
        </span>
      </h2>

      {displayedVocab.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic', background: '#111', borderRadius: '8px' }}>
          No words currently match this status.
        </div>
      ) : (
        <div className="mastery-grid__cards">
          {displayedVocab.map((word) => (
            <VocabCard
              key={word.id}
              word={word}
              onClick={() => setSelectedId(word.id)}
            />
          ))}
        </div>
      )}

      {selectedWord && (
        <WordDetailDrawer 
          word={selectedWord} 
          onClose={() => setSelectedId(null)} 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode}
        />
      )}
    </section>
  );
}
