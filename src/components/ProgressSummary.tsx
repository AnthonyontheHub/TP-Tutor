import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  const { getStatusSummary } = useMasteryStore();
  const summary = getStatusSummary();
  const totalWords = 124;

  const statusItems: { status: MasteryStatus; label: string; color: string }[] = [
    { status: 'not_started', label: 'Not Started', color: '#ffffff' },
    { status: 'introduced', label: 'Introduced', color: '#3b82f6' },
    { status: 'practicing', label: 'Practicing', color: '#f59e0b' },
    { status: 'confident', label: 'Confident', color: '#10b981' },
    { status: 'mastered', label: 'Mastered', color: '#22c55e' },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>{summary.rankTitle}</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Level {summary.level}</div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>{totalWords - summary.not_started} / {totalWords} Words</div>
        </div>
        <div style={{ height: '14px', display: 'flex', borderRadius: '10px', overflow: 'hidden', background: '#222' }}>
          <div style={{ width: `${(summary.not_started / totalWords) * 100}%`, background: '#ffffff', borderRight: '1px solid #000' }} />
          <div style={{ width: `${(summary.introduced / totalWords) * 100}%`, background: '#3b82f6', borderRight: '1px solid #000' }} />
          <div style={{ width: `${(summary.practicing / totalWords) * 100}%`, background: '#f59e0b', borderRight: '1px solid #000' }} />
          <div style={{ width: `${(summary.confident / totalWords) * 100}%`, background: '#10b981', borderRight: '1px solid #000' }} />
          <div style={{ width: `${(summary.mastered / totalWords) * 100}%`, background: '#22c55e' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {statusItems.map((item) => (
          <button
            key={item.status}
            onClick={() => onFilterClick(activeFilter === item.status ? null : item.status)}
            style={{
              background: activeFilter === item.status ? item.color : '#1a1a1a',
              border: 'none', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: activeFilter === item.status && item.status === 'not_started' ? '#000' : '#fff' }}>
              {summary[item.status] || 0}
            </div>
            <div style={{ fontSize: '0.4rem', color: '#888', fontWeight: 'bold', marginTop: '2px', textTransform: 'uppercase' }}>
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
