import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';

interface Props {
  onClose: () => void;
}

export default function SessionHistoryPanel({ onClose }: Props) {
  const { masteryHistory = [] } = useMasteryStore();
  const sortedHistory = [...masteryHistory].reverse();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'S': return 'var(--gold)';
      case 'A': return '#22c55e';
      case 'B': return '#3b82f6';
      case 'C': return '#a855f7';
      default: return 'var(--text-muted)';
    }
  };

  const getGradeShadow = (grade: string | null) => {
    return grade === 'S' ? '0 0 10px rgba(255, 191, 0, 0.5)' : 'none';
  };

  return (
    <motion.div
      className="side-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        width: '100%',
        maxWidth: '500px',
        height: '100%',
        background: 'var(--surface-opaque)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        borderLeft: '1px solid var(--border)'
      }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>SESSION HISTORY</h2>
        <button onClick={onClose} className="close-button">✕</button>
      </header>

      <div className="side-panel-content" style={{ padding: '24px', overflowY: 'auto' }}>
        {sortedHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>🕰️</span>
            No sessions recorded yet. Complete a session with jan Lina to begin your log.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {sortedHistory.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const dateObj = new Date(entry.date);
              const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div key={entry.id} style={{ 
                  background: '#1a1a1a', 
                  borderRadius: '8px', 
                  border: '1px solid #333', 
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '12px' : 0 }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{entry.title || 'Session'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>{dateStr} • XP: +{entry.xpEarned} • Streak: {entry.streakAtClose}</div>
                    </div>
                    {entry.grade && (
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: 900,
                        fontSize: '1rem',
                        color: getGradeColor(entry.grade),
                        border: `1px solid ${getGradeColor(entry.grade)}`,
                        boxShadow: getGradeShadow(entry.grade),
                        background: 'rgba(0,0,0,0.3)'
                      }}>
                        {entry.grade}
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ borderTop: '1px solid #222', paddingTop: '12px', marginTop: '4px' }}>
                          
                          {entry.durationMinutes && (
                            <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '8px' }}>
                              Duration: {entry.durationMinutes} min
                            </div>
                          )}

                          {entry.sessionRecapText && (
                            <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.5', marginBottom: '12px', fontStyle: 'italic', background: '#111', padding: '8px', borderRadius: '4px', borderLeft: '2px solid var(--gold)' }}>
                              "{entry.sessionRecapText}"
                            </div>
                          )}

                          {entry.wordsChanged && entry.wordsChanged.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#666', marginBottom: '6px', letterSpacing: '0.05em' }}>VOCAB PROGRESSION</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {entry.wordsChanged.map((wc, idx) => (
                                  <div key={idx} style={{ background: '#222', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 700, color: '#fff' }}>{wc.word}</span>
                                    <span style={{ color: '#555' }}>|</span>
                                    <span style={{ opacity: 0.7 }} title={STATUS_META[wc.fromStatus]?.label}>{STATUS_META[wc.fromStatus]?.emoji || '⬜'}</span>
                                    <span style={{ color: '#555', fontSize: '0.6rem' }}>▶</span>
                                    <span title={STATUS_META[wc.toStatus]?.label}>{STATUS_META[wc.toStatus]?.emoji || '⬜'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {entry.badgesEarned && entry.badgesEarned.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#666', marginBottom: '6px', letterSpacing: '0.05em' }}>BADGES EARNED</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {entry.badgesEarned.map(badge => (
                                  <div key={badge} style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--gold)' }}>
                                    {badge}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
