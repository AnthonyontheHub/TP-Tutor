import type { VocabWord } from '../types/mastery';

export default function VocabCard({ word, onClick }: { word: VocabWord, onClick?: () => void }) {
  return (
    <div className={`vocab-card vocab-card--${word.status}`} onClick={onClick} style={{ pointerEvents: 'none' }}>
      <div className="vocab-word" style={{ fontWeight: 'bold' }}>{word.word}</div>
      <div className="vocab-pos" style={{ fontSize: '0.65rem' }}>{word.partOfSpeech}</div>
      {word.status === 'mastered' && <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>✅</div>}
    </div>
  );
}
