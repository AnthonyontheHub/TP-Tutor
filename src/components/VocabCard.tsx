/* src/components/VocabCard.tsx */
import { useRef } from 'react';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { useMasteryStore } from '../store/masteryStore';
import { soundService } from '../services/soundService';

interface Props {
  word: VocabWord;
  onLongPress?: (word: VocabWord) => void;
  onClick?: (word: VocabWord) => void;
}

const STATUS_ICONS: Record<MasteryStatus, string> = {
  not_started: '⬜',
  introduced: '🔵',
  practicing: '🟡',
  confident: '🟢',
  mastered: '✅',
};

export default function VocabCard({ word, onLongPress, onClick }: Props) {
  const { cycleWordStatus } = useMasteryStore();
  const status = word.status;

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);
  const hasMovedSignificant = useRef(false);
  const isLongPressActive = useRef(false);

  const handleStatusClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    soundService.playBlip(600, 'sine', 0.05);
    cycleWordStatus(word.id);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    hasMovedSignificant.current = false;
    isLongPressActive.current = false;

    longPressTimer.current = setTimeout(() => {
      if (!hasMovedSignificant.current) {
        isLongPressActive.current = true;
        soundService.playBlip(523.25, 'sine', 0.05);
        onLongPress?.(word);
      }
    }, 600);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    if (dx > 10 || dy > 10) {
      hasMovedSignificant.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isLongPressActive.current) {
      startPos.current = null;
      return;
    }

    if (startPos.current && !hasMovedSignificant.current) {
      // Single Tap -> Trigger onClick (drawer or selection)
      onClick?.(word);
    }
    
    startPos.current = null;
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    startPos.current = null;
    isLongPressActive.current = false;
  };

  return (
    <div
      className={`vocab-card vocab-card--${status}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div 
        className="vocab-card__status"
        onClick={handleStatusClick}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {STATUS_ICONS[status]}
      </div>

      <div className="vocab-card__word">
        {word.type === 'grammar' ? word.sessionNotes : word.word}
      </div>
      <div className="vocab-card__pos">
        {word.type === 'grammar' ? 'GRAMMAR' : word.partOfSpeech}
      </div>
    </div>
  );
}
