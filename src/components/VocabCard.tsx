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
  mastered: 'rgba(34, 197,  green, 0.85)',
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
      className={`glass-panel vocab-card ${isSelected ? 'neon-border-gold active-pulse' : ''} ${isRelated ? 'is-related' : ''}`}
      style={{ 
        touchAction: 'none', 
        padding: '12px 10px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
      <style>{`
        @keyframes activePulse {
          0% { box-shadow: 0 0 10px rgba(255, 191, 0, 0.2); }
          50% { box-shadow: 0 0 20px rgba(255, 191, 0, 0.4); }
          100% { box-shadow: 0 0 10px rgba(255, 191, 0, 0.2); }
        }
        .active-pulse { animation: activePulse 2s infinite; }
        .vocab-card__quick-action {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .vocab-card:hover .vocab-card__quick-action {
          opacity: 1;
        }
      `}</style>

      {/* Top Right Icons */}
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        {hasAIContent && (
          <MessageSquare size={12} className="neon-text-gold" style={{ opacity: 0.8 }} />
        )}
        <div 
          className="vocab-card__status"
          onClick={handleStatusClick}
          style={{ color: statusColor, background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '4px' }}
        >
          {STATUS_ICONS[status]}
        </div>
      </div>

      {/* Quick Action */}
      <div 
        className="vocab-card__quick-action"
        onClick={handleDeepDive}
        style={{ position: 'absolute', bottom: '8px', right: '8px', color: 'var(--gold)', cursor: 'pointer' }}
      >
        <Info size={14} />
      </div>

      <div 
        className="vocab-card__word" 
        style={{ 
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontSize: '0.85rem',
          color: 'var(--text)',
          wordBreak: 'break-word',
          marginTop: '4px'
        }}
      >
        {word.type === 'grammar' ? word.sessionNotes : word.word}
      </div>

      <div className="vocab-card__pos" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
        {word.type === 'grammar' ? 'GRAMMAR' : word.partOfSpeech}
      </div>

      {word.pinnedExample && (
        <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontStyle: 'italic', marginTop: '2px', opacity: 0.6, lineHeight: 1.2 }}>
          "{word.pinnedExample}"
        </div>
      )}
    </div>
  );
}
