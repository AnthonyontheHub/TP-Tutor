/* src/components/VocabCard.tsx */
import { useRef } from 'react';
import type { VocabWord } from '../types/mastery';
import { useMasteryStore } from '../store/masteryStore';
import { soundService } from '../services/soundService';

interface Props {
  word: VocabWord;
  onLongPress?: (word: VocabWord) => void;
  onClick?: (word: VocabWord) => void;
}

export default function VocabCard({ word, onLongPress, onClick }: Props) {
  const { cycleWordStatus } = useMasteryStore();
  const status = word.status;

  const lastTapRef = useRef<number>(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      soundService.playBlip(523.25, 'sine', 0.05);
      onLongPress?.(word);
    }, 500);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Secret Double Tap
      cycleWordStatus(word.id);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      onClick?.(word);
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className={`vocab-card vocab-card--${status}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="vocab-card__word">
        {word.type === 'grammar' ? word.sessionNotes : word.word}
      </div>
      <div className="vocab-card__pos">
        {word.type === 'grammar' ? 'GRAMMAR' : word.partOfSpeech}
      </div>
    </div>
  );
}
