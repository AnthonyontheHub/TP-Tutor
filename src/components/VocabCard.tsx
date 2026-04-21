import type { VocabWord } from '../types/mastery';

interface Props {
  word: VocabWord;
  onClick: () => void;
}

export default function VocabCard({ word, onClick }: Props) {
  return (
    <div
      className={`vocab-card vocab-card--${word.status}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent duplicate triggers
        onClick();
      }}
      role="button"
      tabIndex={0}
      aria-label={`${word.word} — ${word.status.replace('_', ' ')}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{ pointerEvents: 'none' }} // Lets the parent container handle selection logic
    >
      <span className="vocab-card__word">{word.word}</span>
      <span className="vocab-card__pos">{word.partOfSpeech.split(' /')[0].trim()}</span>
    </div>
  );
}
