/* src/components/ProgressSummary.tsx */
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  // Subscribe to vocabulary so the component re-renders on every status change
  // (getStatusSummary is a stable function ref and won't trigger re-renders alone)
  const _vocab = useMasteryStore((s) => s.vocabulary);
  const getStatusSummary = useMasteryStore((s) => s.getStatusSummary);
  const summary = getStatusSummary();

  const statusItems: { status: MasteryStatus; label: string; emoji: string; color: string; glow: string }[] = [
    { status: 'not_started', label: 'NEW',   emoji: '⬜', color: '#6b7280', glow: 'rgba(255,255,255,0.25)' },
    { status: 'introduced',  label: 'INTRO', emoji: '🔵', color: '#3b82f6', glow: 'rgba(59,130,246,0.6)'   },
    { status: 'practicing',  label: 'WORK',  emoji: '🟡', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)'   },
    { status: 'confident',   label: 'GOOD',  emoji: '🟢', color: '#10b981', glow: 'rgba(16,185,129,0.6)'   },
    { status: 'mastered',    label: 'DONE',  emoji: '✅', color: '#22c55e', glow: 'rgba(34,197,94,0.6)'    },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '14px', border: '1px solid #222', marginBottom: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {statusItems.map((item) => {
          const isActive = activeFilter === item.status;
          const isDimmed = activeFilter !== null && !isActive;
          return (
            <button
              key={item.status}
              onClick={() => onFilterClick(isActive ? null : item.status)}
              style={{
                background: isActive ? item.color : '#1a1a1a',
                border: isActive ? `2px solid ${item.color}` : '1px solid #333',
                padding: '10px 4px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                opacity: isDimmed ? 0.25 : 1,
                boxShadow: isActive ? `0 0 16px ${item.glow}` : 'none',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.emoji}</span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>
                {summary[item.status]}
              </span>
              <span style={{ fontSize: '0.48rem', color: isActive ? 'rgba(255,255,255,0.85)' : '#555', fontWeight: '700', letterSpacing: '0.04em' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
