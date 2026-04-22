import type { VocabWord } from '../types/mastery';

export default function VocabCard({ word, onClick }: { word: VocabWord, onClick: () => void }) {
  return (
    <div className={`vocab-card vocab-card--${word.status}`} style={{ pointerEvents: 'none' }}>
      <div className="vocab-card__word">{word.word}</div>
      <div className="vocab-card__pos">{word.partOfSpeech}</div>
    </div>
  );
}
