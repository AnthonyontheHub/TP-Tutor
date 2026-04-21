import type { VocabWord } from '../types/mastery';

export default function VocabCard({ word }: { word: VocabWord, onClick: () => void }) {
  return (
    <div className={`vocab-card vocab-card--${word.status}`} style={{ pointerEvents: 'none' }}>
      <div className="vocab-word">{word.word}</div>
      <div className="vocab-pos">{word.partOfSpeech}</div>
    </div>
  );
}
