/* src/components/VocabCard.tsx */
import type { VocabWord, MasteryStatus } from '../types/mastery';

// Tier boundaries matching scoreToStatus() thresholds.
const TIER_RANGES: Record<MasteryStatus, [number, number]> = {
  not_started: [0,  19],
  introduced:  [20, 39],
  practicing:  [40, 64],
  confident:   [65, 84],
  mastered:    [85, 100],
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
  return Math.min(1, Math.max(0, (score - lo) / (hi - lo)));
}

export default function VocabCard({ word }: { word: VocabWord }) {
  const score  = word.confidenceScore ?? 0;
  const status = word.status;
  const color  = RING_COLOR[status];
  const fill   = progressWithinTier(score, status);

  // SVG ring geometry — sits flush with the card's border edge.
  // The ring radius equals half the card, minus half the stroke so it
  // doesn't overflow. We use a fixed viewport and let CSS size the element.
  const size   = 100;          // SVG viewport units
  const stroke = 3;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const dash   = circ * fill;  // filled arc length
  const gap    = circ - dash;  // empty arc length

  return (
    <div
      className={`vocab-card vocab-card--${status}`}
      style={{ pointerEvents: 'none', position: 'relative' }}
    >
      {/* Confidence ring — absolutely positioned, border layer only */}
      <svg
        aria-hidden
        style={{
          position:  'absolute',
          inset:     -1,            // sits exactly on the 1px border edge
          width:     'calc(100% + 2px)',
          height:    'calc(100% + 2px)',
          borderRadius: '8px',
          overflow:  'visible',
          pointerEvents: 'none',
        }}
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="none"
      >
        {/* Track (full ring, very faint) */}
        <rect
          x={stroke / 2} y={stroke / 2}
          width={size - stroke} height={size - stroke}
          rx={8} ry={8}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeOpacity={0.15}
        />
        {/* Progress arc — uses a circle with dasharray so the fill sweeps
            around the perimeter. We rotate -90° so it starts at the top. */}
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
      <div className="vocab-card__pos">{word.partOfSpeech}</div>
    </div>
  );
}
