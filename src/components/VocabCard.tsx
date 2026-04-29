/* src/components/VocabCard.tsx */
import { useRef } from 'react';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { useMasteryStore } from '../store/masteryStore';
import { soundService } from '../services/soundService';

interface Props {
  word: VocabWord;
  onLongPress?: (word: VocabWord) => void;
  onClick?: (word: VocabWord) => void;
  isSandboxMode: boolean;
  isDimmed?: boolean;
}

const STATUS_ICONS: Record<MasteryStatus, string> = {
  not_started: '⬜',
  introduced: '🟣',
  practicing: '🔵',
  confident: '🟡',
  mastered: '✅',
};

const RING_COLOR: Record<MasteryStatus, string> = {
  not_started: '#ffffff',
  introduced: '#a855f7',
  practicing: '#3b82f6',
  confident: '#f59e0b',
  mastered: '#22c55e',
};

const GLOW_COLOR: Record<MasteryStatus, string> = {
  not_started: 'rgba(255, 255, 255, 0.4)',
  introduced: 'rgba(168, 85, 247, 0.6)',
  practicing: 'rgba(59, 130, 246, 0.6)',
  confident: 'rgba(245, 158, 11, 0.6)',
  mastered: 'rgba(34, 197, 94, 0.65)',
};

export default function VocabCard({ word, onLongPress, onClick, isSandboxMode, isDimmed }: Props) {
  const { cycleWordStatus } = useMasteryStore();
  const status = word.status;

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);
  const hasMovedSignificant = useRef(false);
  const isLongPressActive = useRef(false);

  const handleStatusClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (!isSandboxMode) return;
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

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    startPos.current = null;
    isLongPressActive.current = false;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it was a long press or a significant move, don't trigger a tap
    if (isLongPressActive.current || hasMovedSignificant.current) {
      isLongPressActive.current = false;
      hasMovedSignificant.current = false;
      return;
    }

    onClick?.(word);
  };

  const hasSavedInfo = !!(
    (word.notes && word.notes.trim() !== '') || 
    (word.customDefinition && word.customDefinition.trim() !== '') ||
    (word.sessionNotes && word.sessionNotes.trim() !== '') ||
    (word.userNotes && word.userNotes.trim() !== '')
  );

  return (
    <div
      className={`vocab-card vocab-card--${status}`}
      style={{ 
        touchAction: 'none', 
        borderLeftColor: isDimmed ? 'transparent' : RING_COLOR[status],
        background: isDimmed ? 'rgba(0,0,0,0.5)' : undefined,
        borderColor: isDimmed ? '#222' : undefined,
        boxShadow: isDimmed ? 'none' : (hasSavedInfo ? `0 0 15px ${GLOW_COLOR[status]}, 0 0 5px ${GLOW_COLOR[status]}` : undefined),
        transition: 'all 0.3s ease'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleCardClick}
    >
      <div 
        className="vocab-card__status"
        onClick={handleStatusClick}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {STATUS_ICONS[status]}
      </div>

      <div 
        className="vocab-card__word" 
        style={{ 
          transition: 'all 0.3s ease', 
          color: (hasSavedInfo && !isDimmed) ? 'var(--gold)' : undefined,
          textShadow: isDimmed ? 'none' : (hasSavedInfo ? `0 0 10px ${GLOW_COLOR[status]}` : undefined)
        }}
      >
        {word.type === 'grammar' ? word.sessionNotes : word.word}
      </div>
      <div className="vocab-card__pos" style={{ opacity: isDimmed ? 0.7 : 1, transition: 'all 0.3s ease' }}>
        {word.type === 'grammar' ? 'GRAMMAR' : word.partOfSpeech}
      </div>
      {word.pinnedExample && (
        <div style={{
          fontSize: '0.65rem',
          color: 'var(--gold)',
          fontStyle: 'italic',
          marginTop: '4px',
          opacity: isDimmed ? 0.3 : 0.8,
          lineHeight: 1.2,
          transition: 'all 0.3s ease'
        }}>
          "{word.pinnedExample}"
        </div>
      )}
    </div>
  );
}
