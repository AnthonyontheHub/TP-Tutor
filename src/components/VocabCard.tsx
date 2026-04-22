/* src/components/VocabCard.tsx */
import type { VocabWord } from '../types/mastery';

export default function VocabCard({ word }: { word: VocabWord }) {
  // Removed pointerEvents: 'none'. 
  // The parent MasteryGrid handles the logic, but the card must be interactive 
  // to bubble those pointer events up.
  return (
    <div 
      className={`vocab-card vocab-card--${word.status}`} 
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
