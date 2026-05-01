/* src/components/VocabCard.tsx */
import { useRef } from 'react';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { useMasteryStore } from '../store/masteryStore';
import { soundService } from '../services/soundService';
import { Circle, Sparkles, Zap, ShieldCheck, Crown, Info, MessageSquare } from 'lucide-react';

interface Props {
  word: VocabWord;
  onLongPress?: (word: VocabWord) => void;
  onClick?: (word: VocabWord) => void;
  onAskLina?: (prompt: string) => void;
  isSandboxMode: boolean;
  isDimmed?: boolean;
  isSelected?: boolean;
  isRelated?: boolean;
}

const STATUS_ICONS: Record<MasteryStatus, React.ReactNode> = {
  not_started: <Circle size={14} />,
  introduced: <Sparkles size={14} />,
  practicing: <Zap size={14} />,
  confident: <ShieldCheck size={14} />,
  mastered: <Crown size={14} />,
};

const STATUS_COLORS: Record<MasteryStatus, string> = {
  not_started: '#6b7280',
  introduced: '#a855f7',
  practicing: '#3b82f6',
  confident: '#eab308',
  mastered: '#22c55e',
};

const STATUS_GLOWS: Record<MasteryStatus, string> = {
  not_started: 'rgba(107, 114, 128, 0.4)',
  introduced: 'rgba(168, 85, 247, 0.6)',
  practicing: 'rgba(59, 130, 246, 0.6)',
  confident: 'rgba(234, 179, 8, 0.6)',
  mastered: 'rgba(34, 197, 94, 0.85)',
};

export default function VocabCard({ word, onLongPress, onClick, onAskLina, isSandboxMode, isDimmed, isSelected, isRelated }: Props) {
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
    if (isLongPressActive.current || hasMovedSignificant.current) {
      isLongPressActive.current = false;
      hasMovedSignificant.current = false;
      return;
    }
    onClick?.(word);
  };

  const handleDeepDive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAskLina) {
      onAskLina(`[SYSTEM: Deep-dive explanation for the word: '${word.word}']. Please explain its nuance and give me a unique example sentence.`);
    }
  };

  const hasAIContent = !!(word.aiExplanation || (word.sessionNotes && word.sessionNotes.length > 0));
  const statusColor = STATUS_COLORS[status];

  return (
    <div
      className={`glass-panel vocab-card ${isSelected ? 'neon-border-gold active-pulse' : ''} ${isRelated ? 'is-related' : ''} touch-pan-y flex flex-col gap-1 transition-all duration-300 ease-in-out`}
      style={{ 
        opacity: isDimmed ? 0.3 : 1,
        borderColor: isSelected ? 'var(--gold)' : (isDimmed ? '#222' : statusColor),
        boxShadow: isSelected 
          ? '0 0 20px rgba(255, 191, 0, 0.2)'
          : (isDimmed ? 'none' : `0 0 10px ${STATUS_GLOWS[status]}`),
        zIndex: isSelected ? 10 : (isRelated ? 5 : 1)
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleCardClick}
    >
      <div className="vocab-card__bg-symbol">{word.word}</div>

      {/* Top Right Icons */}
      <div className="absolute top-2 right-2 flex gap-[6px] items-center">
        {hasAIContent && (
          <MessageSquare size={12} className="neon-text-gold opacity-80" />
        )}
        <div 
          className="vocab-card__status p-1 rounded-[4px] bg-white/5"
          onClick={handleStatusClick}
          style={{ color: statusColor }}
        >
          {STATUS_ICONS[status]}
        </div>
      </div>

      {/* Quick Action */}
      <div 
        className="vocab-card__quick-action absolute bottom-2 right-2 text-[var(--gold)] cursor-pointer"
        onClick={handleDeepDive}
      >
        <Info size={14} />
      </div>

      {word.weight === 'ku' && (
        <div 
          className="absolute bottom-2 left-2 text-[0.5rem] font-black text-[var(--gold)] opacity-30 tracking-tighter"
          style={{ pointerEvents: 'none' }}
        >
          KU
        </div>
      )}

      <div 
        className="vocab-card__word font-black tracking-[0.15em] text-[0.85rem] text-[var(--text)] break-words mt-1" 
      >
        {word.type === 'grammar' ? word.sessionNotes : word.word}
      </div>

      <div className="vocab-card__pos text-[0.6rem] text-[var(--text-muted)] uppercase tracking-[0.05em] font-bold">
        {word.type === 'grammar' ? 'GRAMMAR' : word.partOfSpeech.split(',')[0].trim()}
      </div>

      {word.pinnedExample && (
        <div className="text-[0.65rem] text-[var(--gold)] italic mt-[2px] opacity-60 leading-[1.2]">
          "{word.pinnedExample}"
        </div>
      )}
    </div>
  );
}
