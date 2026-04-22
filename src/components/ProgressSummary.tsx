import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  // Subscribe directly to vocabulary to guarantee component reactivity
  useMasteryStore((s) => s.vocabulary); 
  const { getStatusSummary } = useMasteryStore();
  const summary = getStatusSummary();

  const statusItems: { status: MasteryStatus; label: string; color: string }[] = [
    { status: 'not_started', label: 'NOT STARTED', color: '#6b7280' },
    { status: 'introduced', label: 'INTRODUCED', color: '#3b82f6' },
    { status: 'practicing', label: 'PRACTICING', color: '#f59e0b' },
    { status: 'confident', label: 'CONFIDENT', color: '#10b981' },
    { status: 'mastered', label: 'MASTERED', color: '#ec4899' },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>
      
      {/* Mastery Counts (Clickable Filters) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {statusItems.map((item) => (
          <button
            key={item.status}
            onClick={() => onFilterClick(activeFilter === item.status ? null : item.status)}
            style={{
              background: activeFilter === item.status ? item.color : '#1a1a1a',
              border: 'none',
              padding: '12px 8px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
              {summary[item.status] || 0}
            </div>
            <div style={{ fontSize: '0.55rem', color: activeFilter === item.status ? 'white' : '#888', fontWeight: 'bold', marginTop: '4px', textTransform: 'uppercase' }}>
              {item.label}
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
