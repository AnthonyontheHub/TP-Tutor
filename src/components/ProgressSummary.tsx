/* src/components/ProgressSummary.tsx */
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';
import { Circle, Sparkles, Zap, ShieldCheck, Crown } from 'lucide-react';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  const getStatusSummary = useMasteryStore((s) => s.getStatusSummary);
  const summary = getStatusSummary();

  const statusItems: { status: MasteryStatus; label: string; icon: React.ReactNode; color: string; glow: string }[] = [
    { status: 'not_started', label: 'PENDING',    icon: <Circle size={14} />,      color: '#6b7280', glow: 'rgba(107, 114, 128, 0.4)' },
    { status: 'introduced',  label: 'INTRODUCED', icon: <Sparkles size={14} />,    color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)'  },
    { status: 'practicing',  label: 'PRACTICING', icon: <Zap size={14} />,         color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)'  },
    { status: 'confident',   label: 'CONFIDENT',  icon: <ShieldCheck size={14} />, color: '#eab308', glow: 'rgba(234, 179, 8, 0.6)'   },
    { status: 'mastered',    label: 'MASTERED',   icon: <Crown size={14} />,       color: '#22c55e', glow: 'rgba(34, 197, 94, 0.65)'  },
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', border: '1px solid var(--border)' }}>
      <div className="status-grid-mobile overflow-x-auto hide-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {statusItems.map((item) => {
          const isActive = activeFilter === item.status;
          const isDimmed = activeFilter !== null && !isActive;
          
          return (
            <button
              key={item.status}
              onClick={() => onFilterClick(isActive ? null : item.status)}
              className="status-card-mobile"
              style={{
                background: isActive ? `${item.color}11` : 'var(--surface)',
                border: isActive ? `1px solid ${item.color}` : `1px solid ${item.color}33`,
                padding: '12px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isDimmed ? 0.3 : 1,
                boxShadow: isDimmed 
                  ? 'none' 
                  : (isActive ? `0 0 15px ${item.glow}` : `0 0 10px ${item.glow}`),
                transform: isActive ? 'translateY(-2px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{ color: item.color, transition: 'color 0.3s' }}>
                {item.icon}
              </div>
              <span style={{ 
                fontSize: '1.1rem', 
                fontWeight: 900, 
                color: isActive ? item.color : 'white', 
                lineHeight: 1,
                letterSpacing: '0.1em',
                transition: 'color 0.3s'
              }}>
                {summary[item.status]}
              </span>
              <span style={{
                fontSize: '0.55rem',
                color: isActive ? item.color : 'var(--text-muted)',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.3s'
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
