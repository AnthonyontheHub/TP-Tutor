import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';

export default function MasteryGrid() {
  const vocabulary = useMasteryStore((s) => s.vocabulary);

  return (
    <section className="mastery-grid">
      <h2 className="section-title">
        VOCABULARY{' '}
        <span className="section-title__count">— {vocabulary.length} WORDS</span>
      </h2>
      <div className="mastery-grid__cards">
        {vocabulary.map((word) => (
          <VocabCard key={word.id} word={word} />
        ))}
      </div>
    </section>
  );
}
