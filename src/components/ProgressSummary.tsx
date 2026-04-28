/* src/components/ProgressSummary.tsx */
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  const getStatusSummary = useMasteryStore((s) => s.getStatusSummary);
  const summary = getStatusSummary();

  const statusItems: { status: MasteryStatus; label: string; emoji: string; color: string; glow: string }[] = [
    { status: 'not_started', label: 'PENDING',    emoji: '⬜', color: '#ffffff', glow: 'rgba(255,255,255,0.4)' },
    { status: 'introduced',  label: 'INTRODUCED',  emoji: '🟣', color: '#a855f7', glow: 'rgba(168,85,247,0.6)'  },
    { status: 'practicing',  label: 'PRACTICING',  emoji: '🔵', color: '#3b82f6', glow: 'rgba(59,130,246,0.6)'  },
    { status: 'confident',   label: 'CONFIDENT',   emoji: '🟡', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)'   },
    { status: 'mastered',    label: 'MASTERED',    emoji: '✅', color: '#22c55e', glow: 'rgba(34,197,94,0.65)'  },
  ];
  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '14px', border: '1px solid #222', marginBottom: '14px' }}>
      <div className="status-grid-mobile overflow-x-auto hide-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {statusItems.map((item) => {
          const isActive = activeFilter === item.status;
          const isDimmed = activeFilter !== null && !isActive;
          const shouldGlow = activeFilter === null || isActive;
          
          return (
            <button
              key={item.status}
              onClick={() => onFilterClick(isActive ? null : item.status)}
              className="status-card-mobile"
              style={{
                background: isActive ? `${item.color}22` : '#0d0d0d',
                border: isActive ? `2px solid ${item.color}` : `1px solid ${item.color}44`,
                padding: '10px 4px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                opacity: isDimmed ? 0.3 : 1,
                boxShadow: shouldGlow
                  ? `0 0 14px ${item.glow}, 0 0 4px ${item.glow}`
                  : 'none',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.emoji}</span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: item.color, lineHeight: 1 }}>
                {summary[item.status]}
              </span>
              <span style={{
                fontSize: '0.48rem',
                color: isActive ? item.color : `${item.color}99`,
                fontWeight: '700',
                letterSpacing: '0.04em',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
