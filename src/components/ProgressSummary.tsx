/* src/components/ProgressSummary.tsx */
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  useMasteryStore((s) => s.vocabulary); 
  const { getStatusSummary, savedPhrases } = useMasteryStore();
  const summary = getStatusSummary();

  const statusItems: { status: MasteryStatus; label: string; color: string }[] = [
    { status: 'not_started', label: 'NOT STARTED', color: '#505050' },
    { status: 'introduced', label: 'INTRODUCED', color: '#3b82f6' },
    { status: 'practicing', label: 'PRACTICING', color: '#f59e0b' },
    { status: 'confident', label: 'CONFIDENT', color: '#10b981' },
    { status: 'mastered', label: 'MASTERED', color: '#ec4899' },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <h3 style={{ fontSize: '0.8rem', color: '#444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vocabulary Overview</h3>
         <div style={{ fontSize: '0.7rem', color: '#888' }}>{savedPhrases.length} Phrases Saved</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {statusItems.map((item) => {
          const isSelected = activeFilter === item.status;
          const noFilter = activeFilter === null;
          const isActive = isSelected || noFilter;

          return (
            <button
              key={item.status}
              onClick={() => onFilterClick(isSelected ? null : item.status)}
              style={{
                background: '#0a0a0a',
                border: `2px solid ${isActive ? item.color : '#222'}`,
                padding: '12px 4px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                boxShadow: isActive ? `0 0 12px ${item.color}44, inset 0 0 8px ${item.color}22` : 'none',
                opacity: isActive ? 1 : 0.3,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: isActive ? item.color : '#666', textShadow: isActive ? `0 0 8px ${item.color}aa` : 'none' }}>
                {summary[item.status]}
              </div>
              <div style={{ fontSize: '0.45rem', color: isActive ? 'white' : '#444', fontWeight: '900', marginTop: '4px', letterSpacing: '0.02em', lineHeight: '1.1' }}>
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
