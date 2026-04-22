import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  activeFilter: MasteryStatus | null;
  onFilterClick: (status: MasteryStatus | null) => void;
}

export default function ProgressSummary({ activeFilter, onFilterClick }: Props) {
  const { getStatusSummary, savedPhrases } = useMasteryStore();
  const summary = getStatusSummary();

  const badges = [
    { icon: '🌱', label: 'Newcomer', unlocked: (summary.introduced + summary.practicing) >= 5 },
    { icon: '🗣️', label: 'Speaker', unlocked: summary.confident >= 15 },
    { icon: '🦉', label: 'Philosopher', unlocked: summary.mastered >= 10 },
    { icon: '📚', label: 'Writer', unlocked: savedPhrases.length >= 5 },
  ];

  const statusItems: { status: MasteryStatus; label: string; color: string; icon?: string }[] = [
    { status: 'not_started', label: 'NOT STARTED', color: '#ffffff' },
    { status: 'introduced', label: 'INTRO', color: '#3b82f6' },
    { status: 'practicing', label: 'WORK', color: '#f59e0b' },
    { status: 'confident', label: 'GOOD', color: '#10b981' },
    { status: 'mastered', label: 'DONE', color: '#10b981', icon: '✅' },
  ];

  return (
    <div style={{ background: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #222', marginBottom: '20px' }}>
      
      {/* Achievement Badges Row */}
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

      {/* Level & XP Progress Bar */}
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
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: activeFilter === item.status && item.color === '#ffffff' ? '#000' : 'white' }}>
              {item.icon ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {summary[item.status]} <span style={{ fontSize: '0.8rem' }}>{item.icon}</span>
                </div>
              ) : (
                summary[item.status]
              )}
            </div>
            <div style={{ fontSize: '0.45rem', color: activeFilter === item.status ? (item.color === '#ffffff' ? '#000' : 'white') : '#888', fontWeight: 'bold', marginTop: '4px' }}>
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
