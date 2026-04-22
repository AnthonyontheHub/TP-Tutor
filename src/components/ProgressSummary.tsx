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
          <div>
            <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase' }}>{summary.rankTitle}</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Level {summary.level}</div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>{summary.xp % 500} / 500 XP</div>
        </div>
        <div style={{ height: '6px', background: '#222', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${(summary.xp % 500) / 5}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Glowing Mastery Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
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
                padding: '14px 8px',
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'center',
                boxShadow: isActive ? `0 0 15px ${item.color}44, inset 0 0 10px ${item.color}22` : 'none',
                opacity: isActive ? 1 : 0.3,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: isActive ? item.color : '#666', textShadow: isActive ? `0 0 8px ${item.color}aa` : 'none' }}>
                {summary[item.status]}
              </div>
              <div style={{ fontSize: '0.55rem', color: isActive ? 'white' : '#444', fontWeight: '900', marginTop: '4px', letterSpacing: '0.05em' }}>
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #222' }}>
        <div style={{ fontSize: '0.6rem', color: '#444', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Knowledge Activity</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: i > 17 ? '#10b981' : (i > 10 ? '#064e3b' : '#1a1a1a'), opacity: i === 20 ? 1 : 0.5 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
