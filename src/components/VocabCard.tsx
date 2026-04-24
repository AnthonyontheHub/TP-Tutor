/* src/components/VocabCard.tsx */
import type { VocabWord, MasteryStatus } from '../types/mastery';

// Fixed progress fill per status tier — no numeric score needed.
const STATUS_FILL: Record<MasteryStatus, number> = {
  not_started: 0,
  introduced:  0.25,
  practicing:  0.5,
  confident:   0.75,
  mastered:    1,
};

const RING_COLOR: Record<MasteryStatus, string> = {
  not_started: '#374151',
  introduced:  '#1d4ed8',
  practicing:  '#92400e',
  confident:   '#16a34a',
  mastered:    '#22c55e',
};

export default function VocabCard({ word }: { word: VocabWord }) {
  const status = word.status;
  const color  = RING_COLOR[status];
  const fill   = STATUS_FILL[status];

  const size   = 100;
  const stroke = 3;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const dash   = circ * fill;
  const gap    = circ - dash;

  return (
    <div
      className={`vocab-card vocab-card--${status}`}
      style={{ pointerEvents: 'none', position: 'relative' }}
    >
      <svg
        aria-hidden
        style={{
          position:     'absolute',
          inset:        -1,
          width:        'calc(100% + 2px)',
          height:       'calc(100% + 2px)',
          borderRadius: '8px',
          overflow:     'visible',
          pointerEvents: 'none',
        }}
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="none"
      >
        <rect
          x={stroke / 2} y={stroke / 2}
          width={size - stroke} height={size - stroke}
          rx={8} ry={8}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeOpacity={0.15}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeOpacity={0.85}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>

      <div className="vocab-card__word">{word.word}</div>
    </div>
  );
}
