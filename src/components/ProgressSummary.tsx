import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  const { getStatusSummary } = useMasteryStore();
  const summary = getStatusSummary();
  
  const totalWords = summary.not_started + summary.introduced + summary.practicing + summary.confident + summary.mastered;
  const learnedWords = totalWords - summary.not_started;

  const statusItems: { status: MasteryStatus; label: string; color: string; icon?: string }[] = [
    { status: 'not_started', label: 'NEW', color: '#ffffff' },
    { status: 'introduced', label: 'INTRO', color: '#3b82f6' },
    { status: 'practicing', label: 'WORK', color: '#f59e0b' },
    { status: 'confident', label: 'GOOD', color: '#10b981' },
    { status: 'mastered', label: 'DONE', color: '#22c55e', icon: '✅' },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>

      {/* Segmented Mastery Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Vocabulary Mastery
          </div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>
            {learnedWords} / {totalWords} words
          </div>
        </div>
        
        <div style={{ display: 'flex', height: '12px', background: '#222', borderRadius: '10px', overflow: 'hidden' }}>
          {statusItems.map((item) => {
            const count = summary[item.status];
            if (count === 0) return null;
            const widthPercent = (count / totalWords) * 100;
            return (
              <div 
                key={`segment-${item.status}`} 
                style={{ 
                  width: `${widthPercent}%`, 
                  height: '100%', 
                  background: item.color, 
                  transition: 'width 0.4s ease',
                  borderRight: '1px solid #111'
                }} 
                title={`${item.label}: ${count}`}
              />
            );
          })}
        </div>
      </div>

      {/* Mastery Counts (Clickable Filters) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {statusItems.map((item) => (
          <button
            key={item.status}
            onClick={() => onFilterClick(activeFilter === item.status ? null : item.status)}
            style={{
              background: activeFilter === item.status ? item.color : '#1a1a1a',
              border: 'none',
              padding: '12px 4px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: activeFilter === item.status && item.status === 'not_started' ? '#000' : 'white' }}>
              {item.icon ? item.icon : summary[item.status]}
            </div>
            <div style={{ fontSize: '0.5rem', color: activeFilter === item.status ? (item.status === 'not_started' ? '#000' : 'white') : '#666', fontWeight: 'bold', marginTop: '2px' }}>
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
