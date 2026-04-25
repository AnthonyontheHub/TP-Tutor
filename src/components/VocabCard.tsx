/* src/components/VocabCard.tsx */
import { useRef } from 'react';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { useMasteryStore } from '../store/masteryStore';
import { soundService } from '../services/soundService';

// Tier boundaries matching scoreToStatus() thresholds.
const TIER_RANGES: Record<MasteryStatus, [number, number]> = {
  not_started: [0,  0],
  introduced:  [1, 50],
  practicing:  [51, 150],
  confident:   [151, 400],
  mastered:    [401, 500],
};

const RING_COLOR: Record<MasteryStatus, string> = {
  not_started: '#374151',
  introduced:  '#1d4ed8',
  practicing:  '#92400e',
  confident:   '#16a34a',
  mastered:    '#22c55e',
};

// How far through the current tier the score is, as a 0–1 fraction.
function progressWithinTier(score: number, status: MasteryStatus): number {
  const [lo, hi] = TIER_RANGES[status];
  if (hi === lo) return 1;
  return Math.min(1, Math.max(0, (score - lo) / (hi - lo)));
}

interface Props {
  word: VocabWord;
  onLongPress?: (word: VocabWord) => void;
  onClick?: (word: VocabWord) => void;
}

export default function VocabCard({ word, onLongPress, onClick }: Props) {
  const { cycleWordStatus } = useMasteryStore();
  const score  = word.confidenceScore ?? 0;
  const status = word.status;
  const color  = RING_COLOR[status];
  const fill   = progressWithinTier(score, status);

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
      style={{ position: 'relative', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Confidence ring */}
      <svg
        aria-hidden
        style={{
          position:  'absolute',
          inset:     -1,
          width:     'calc(100% + 2px)',
          height:    'calc(100% + 2px)',
          borderRadius: '8px',
          overflow:  'visible',
          pointerEvents: 'none',
        }}
        viewBox={`0 0 100 100`}
        preserveAspectRatio="none"
      >
        <rect
          x={1.5} y={1.5}
          width={97} height={97}
          rx={8} ry={8}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeOpacity={0.15}
        />
        <circle
          cx={50} cy={50} r={48.5}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeOpacity={0.85}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 48.5 * fill} ${2 * Math.PI * 48.5 * (1 - fill)}`}
          transform={`rotate(-90 50 50)`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>

      <div className="vocab-card__word">{word.word}</div>
      <div className="vocab-card__pos">{word.partOfSpeech}</div>
    </div>
  );
}
