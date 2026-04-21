import type { VocabWord } from '../types/mastery';

interface Props {
  word: VocabWord;
  onClick: () => void;
}

export default function VocabCard({ word, onClick }: Props) {
  return (
    <div
      className={`vocab-card vocab-card--${word.status}`}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
      role="button"
    >
      <span className="vocab-card__word" style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700 }}>{word.word}</span>
      <span className="vocab-card__pos" style={{ fontSize: '0.7rem', opacity: 0.7 }}>{word.partOfSpeech}</span>
    </div>
  );
}
