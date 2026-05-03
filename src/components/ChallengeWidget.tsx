import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

const ChallengeWidget: React.FC = () => {
  const { currentChallenge, generateWeeklyChallenge } = useMasteryStore();
  const [isExpanded, setIsEditing] = useState(false); // Using setIsExpanded instead of setIsEditing but following naming style

  if (!currentChallenge) {
    return (
      <div 
        onClick={() => generateWeeklyChallenge()}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer' }}
      >
        <div style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em' }}>WEEKLY CHALLENGE</div>
        <div style={{ color: 'white', fontSize: '0.85rem', marginTop: '4px' }}>Generating challenge...</div>
      </div>
    );
  }

  const { title, description, currentCount, targetCount, completed, xpReward } = currentChallenge;
  const progress = Math.min((currentCount / targetCount) * 100, 100);

  return (
    <motion.div 
      layout
      onClick={() => setIsEditing(!isExpanded)}
      style={{ 
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid var(--border)', 
        padding: '12px 20px', 
        borderRadius: '8px', 
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em' }}>WEEKLY CHALLENGE</div>
          <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800, marginTop: '2px' }}>{title}</div>
        </div>
        <div style={{ textAlign: 'right', marginLeft: '12px' }}>
          {completed ? (
            <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 900 }}>✅ COMPLETE</span>
          ) : (
            <span style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 900 }}>+{xpReward} XP</span>
          )}
        </div>
      </div>

      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          style={{ height: '100%', background: 'var(--gold)', borderRadius: '2px' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.65rem', opacity: 0.5, fontWeight: 800 }}>
        <span>{currentCount} / {targetCount}</span>
        {!isExpanded && <span>TAP TO SEE MORE</span>}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '12px', lineHeight: '1.4', marginBottom: 0 }}>
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChallengeWidget;
