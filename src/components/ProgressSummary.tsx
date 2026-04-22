import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const { getStatusSummary, savedPhrases } = useMasteryStore();
  const summary = getStatusSummary();

  const badges = [
    { icon: '🌱', label: 'Newcomer', unlocked: (summary.introduced + summary.practicing) >= 5 },
    { icon: '🗣️', label: 'Speaker', unlocked: summary.confident >= 15 },
    { icon: '🦉', label: 'Philosopher', unlocked: summary.mastered >= 10 },
    { icon: '📚', label: 'Writer', unlocked: savedPhrases.length >= 5 },
  ];

  const statusItems: { status: MasteryStatus; label: string; color: string }[] = [
    { status: 'introduced', label: 'INTRO', color: '#3b82f6' },
    { status: 'practicing', label: 'WORK', color: '#f59e0b' },
    { status: 'confident', label: 'GOOD', color: '#10b981' },
    { status: 'mastered', label: 'DONE', color: '#ec4899' },
  ];

  const totalWords = Math.max(1, vocabulary.length);

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px', scrollbarWidth: 'none' }}>
        {badges.map((badge, i) => (
          <div key={i} style={{ textAlign: 'center', opacity: badge.unlocked ? 1 : 0.2, filter: badge.unlocked ? 'none' : 'grayscale(1)', minWidth: '60px' }}>
            <div style={{ fontSize: '1.5rem', background: '#222', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
              {badge.icon}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>{badge.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Vocabulary Progress</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>{vocabulary.length} Words</div>
        </div>
        <div style={{ height: '8px', background: '#222', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(summary.mastered / totalWords) * 100}%`, height: '100%', background: '#ec4899', transition: 'width 0.5s ease' }} />
          <div style={{ width: `${(summary.confident / totalWords) * 100}%`, height: '100%', background: '#10b981', transition: 'width 0.5s ease' }} />
          <div style={{ width: `${(summary.practicing / totalWords) * 100}%`, height: '100%', background: '#f59e0b', transition: 'width 0.5s ease' }} />
          <div style={{ width: `${(summary.introduced / totalWords) * 100}%`, height: '100%', background: '#3b82f6', transition: 'width 0.5s ease' }} />
        </div>
      </div>

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
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{summary[item.status]}</div>
            <div style={{ fontSize: '0.5rem', color: activeFilter === item.status ? 'white' : '#666', fontWeight: 'bold', marginTop: '2px' }}>{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
