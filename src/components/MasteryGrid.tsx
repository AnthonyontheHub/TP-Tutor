import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';

interface Props {
  onAskLina: (prompt: string) => void;
}

export default function MasteryGrid({ onAskLina }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedWord = selectedId
    ? (vocabulary.find((w) => w.id === selectedId) ?? null)
    : null;

  return (
    <section className="mastery-grid">
      <h2 className="section-title">
        VOCABULARY{' '}
        <span className="section-title__count">— {vocabulary.length} WORDS</span>
      </h2>

      <div className="mastery-grid__cards">
        {vocabulary.map((word) => (
          <VocabCard
            key={word.id}
            word={word}
            onClick={() => setSelectedId(word.id)}
          />
        ))}
      </div>

      {selectedWord && (
        <WordDetailDrawer 
          word={selectedWord} 
          onClose={() => setSelectedId(null)} 
          onAskLina={onAskLina} 
        />
      )}
    </section>
  );
}
