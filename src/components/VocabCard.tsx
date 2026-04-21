import type { VocabWord } from '../types/mastery';

export default function VocabCard({ word }: { word: VocabWord, onClick: () => void }) {
  return (
    <div className={`vocab-card vocab-card--${word.status}`} style={{ pointerEvents: 'none' }}>
      <div className="vocab-word" style={{ fontWeight: 'bold' }}>{word.word}</div>
      <div className="vocab-pos" style={{ fontSize: '0.7rem' }}>{word.partOfSpeech}</div>
    </div>
  );
}
