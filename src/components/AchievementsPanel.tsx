/* src/components/AchievementsPanel.tsx */
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
}

export default function AchievementsPanel({ onClose }: Props) {
  const { getStatusSummary, currentStreak, profile } = useMasteryStore();
  const summary = getStatusSummary();
  const history = profile.history || [];

  // Simple SVG Line Graph logic
  const chartHeight = 100;
  const chartWidth = 300;
  const maxXP = Math.max(...history.map(s => s.xp), 500);
  const points = history.map((s, i) => {
    const x = (i / (Math.max(history.length - 1, 1))) * chartWidth;
    const y = chartHeight - (s.xp / maxXP) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div
      className="side-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="side-panel-header">
        <button onClick={onClose} className="btn-back">
          <span>✕</span> CLOSE
        </button>
        <h2 style={{ marginLeft: '16px', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>ACHIEVEMENTS</h2>
      </header>

      <div className="side-panel-content">
        <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '24px', border: '1px solid var(--gold)', boxShadow: '0 0 20px rgba(255, 191, 0, 0.1)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Operational Rank</div>
          <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{summary.rankTitle}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--gold)', marginTop: '4px', fontWeight: 700 }}>LEVEL {summary.level}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div className="glass-panel" style={{ padding: '15px' }}>
            <div style={{ fontSize: '0.55rem', color: '#666', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total XP</div>
            <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 900 }}>{summary.xp}</div>
          </div>
          <div className="glass-panel" style={{ padding: '15px' }}>
            <div style={{ fontSize: '0.55rem', color: '#666', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Current Streak</div>
            <div style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 900 }}>🔥 {currentStreak}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Progress History</h3>
          <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '10px 0', marginTop: '10px' }}>
            {history.length > 1 ? (
              <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M0,${chartHeight} ${points} L${chartWidth},${chartHeight} Z`}
                  fill="url(#goldGradient)"
                />
                <polyline
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="2"
                  points={points}
                  style={{ filter: 'drop-shadow(0 0 8px var(--gold))' }}
                />
              </svg>
            ) : (
              <div style={{ color: '#444', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center' }}>Synchronize more daily streaks to generate progress mapping.</div>
            )}
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Neural Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {history.slice().reverse().slice(0, 10).map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ color: '#888' }}>{s.date}</span>
                <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{s.xp} XP</span>
              </div>
            ))}
            {history.length === 0 && <div style={{ color: '#444', fontSize: '0.75rem' }}>No data points recorded.</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
