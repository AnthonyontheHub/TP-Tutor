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
     { status: 'not_started', label: 'NOT START', color: '#ffffff' },

    { status: 'introduced', label: 'INTRODUCED', color: '#3b82f6' },

    { status: 'practicing', label: 'PRACTICING', color: '#f59e0b' },

    { status: 'confident', label: 'CONFIDENT', color: '#10b981' },

    { status: 'mastered', label: 'MASTERED', color: '#ec4899' },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>
      
      {/* Mastery Counts (Clickable Filters) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
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
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>
              {summary[item.status]}
            </div>
            <div style={{ fontSize: '0.5rem', color: activeFilter === item.status ? 'white' : '#666', fontWeight: 'bold', marginTop: '2px' }}>
              {item.label}
            </div>
          </button>
        ))}
      </div>

      {/* Weekly Heatmap (Simulation) */}
      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #222' }}>
        <div style={{ fontSize: '0.6rem', color: '#444', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Knowledge Activity</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: 21 }).map((_, i) => (
            <div 
              key={i} 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '2px', 
                background: i > 17 ? '#10b981' : (i > 10 ? '#064e3b' : '#1a1a1a'),
                opacity: i === 20 ? 1 : 0.5
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
