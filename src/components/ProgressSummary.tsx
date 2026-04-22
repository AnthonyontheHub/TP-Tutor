/* src/components/ProgressSummary.tsx */
import { useMasteryStore } from '../store/masteryStore';
import { MasteryStatus, STATUS_META } from '../types/mastery';

export default function ProgressSummary({ activeFilter, onFilterClick }: { activeFilter: MasteryStatus | null, onFilterClick: (s: MasteryStatus | null) => void }) {
  const summary = useMasteryStore((s) => s.getStatusSummary());

  const statusItems: { status: MasteryStatus; label: string; color: string; glow: string }[] = [
    { status: 'not_started', label: 'NEW', color: '#505050', glow: 'rgba(255,255,255,0.2)' },
    { status: 'introduced', label: 'INTRO', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)' },
    { status: 'practicing', label: 'WORK', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
    { status: 'confident', label: 'GOOD', color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
    { status: 'mastered', label: 'DONE', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)' },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {statusItems.map((item) => {
          const isActive = activeFilter === item.status;
          const isOthersDark = activeFilter !== null && !isActive;
          
          return (
            <button
              key={item.status}
              onClick={() => onFilterClick(isActive ? null : item.status)}
              style={{
                background: isActive ? item.color : '#1a1a1a',
                border: isActive ? `2px solid ${item.color}` : '1px solid #333',
                padding: '12px 4px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: isOthersDark ? 0.3 : 1,
                boxShadow: isActive ? `0 0 20px ${item.glow}` : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>{summary[item.status]}</div>
              <div style={{ fontSize: '0.5rem', color: isActive ? 'white' : '#666', fontWeight: 'bold', marginTop: '4px' }}>{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
