import type { VocabWord } from '../types/mastery';

export default function VocabCard({ word, onClick }: { word: VocabWord, onClick: () => void }) {
  return (
    <div className={`vocab-card vocab-card--${word.status}`} style={{ pointerEvents: 'none' }}>
      <div className="vocab-word" style={{ fontWeight: 'bold' }}>{word.word}</div>
      <div className="vocab-pos" style={{ fontSize: '0.7rem' }}>{word.partOfSpeech}</div>
      {word.status === 'mastered' && (
        <div style={{ position: 'absolute', top: -5, right: -5, background: '#111', borderRadius: '50%', padding: '2px', fontSize: '0.8rem', border: '1px solid #22c55e' }}>
          ✅
        </div>
      )}
    </div>
  );
}
