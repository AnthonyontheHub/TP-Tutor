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

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);
  const startPos = useRef<{ x: number, y: number } | null>(null);
  const hasMovedSignificant = useRef(false);
  const isLongPressActive = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary pointer (usually finger or left mouse)
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

    // If it was a long press, we've already handled it.
    if (isLongPressActive.current) {
      startPos.current = null;
      return;
    }

    // If we didn't move significantly, it's a tap or double-tap.
    if (startPos.current && !hasMovedSignificant.current) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double Tap -> Cycle status
        cycleWordStatus(word.id);
        lastTapRef.current = 0; // Reset
      } else {
        // Single Tap -> Trigger onClick (drawer or selection)
        lastTapRef.current = now;
        onClick?.(word);
      }
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
      <div className="vocab-card__word">
        {word.type === 'grammar' ? word.sessionNotes : word.word}
      </div>
      <div className="vocab-card__pos">
        {word.type === 'grammar' ? 'GRAMMAR' : word.partOfSpeech}
      </div>
    </div>
  );
}
