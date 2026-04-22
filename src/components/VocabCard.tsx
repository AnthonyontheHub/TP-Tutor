/* src/components/VocabCard.tsx */
import type { VocabWord } from '../types/mastery';

interface VocabCardProps {
  word: VocabWord;
  onClick: () => void;
}

export default function VocabCard({ word }: VocabCardProps) {
  return (
    <div 
      className={`vocab-card vocab-card--${word.status}`} 
      style={{ pointerEvents: 'none' }}
    >
      <div className="vocab-card__word">
        {word.word}
      </div>
      <div className="vocab-card__pos">
        {word.partOfSpeech}
      </div>
    </div>
  );
}
