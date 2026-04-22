/* src/components/VocabCard.tsx */
import type { VocabWord } from '../types/mastery';

export default function VocabCard({ word }: { word: VocabWord }) {
  // pointerEvents: 'none' is essential so the MasteryGrid parent can handle 
  // long-press vs tap logic without the inner divs intercepting clicks.
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
