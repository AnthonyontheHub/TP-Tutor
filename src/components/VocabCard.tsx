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
  const startPos = useRef<{ x: number, y: number } | null>(null);
  const hasMovedSignificant = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    hasMovedSignificant.current = false;

    longPressTimer.current = setTimeout(() => {
      if (!hasMovedSignificant.current) {
        soundService.playBlip(523.25, 'sine', 0.05);
        onLongPress?.(word);
        startPos.current = null; // Mark as handled
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

    if (startPos.current && !hasMovedSignificant.current) {
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
