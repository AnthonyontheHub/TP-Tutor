import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { Clock, Zap, Info } from 'lucide-react';

const ChallengeWidget: React.FC = () => {
  const { 
    currentChallenge, 
    currentDailyChallenge,
    dailySnoozedUntil,
    weeklySnoozedUntil,
    snoozeChallenge
  } = useMasteryStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dailySnoozed = dailySnoozedUntil && new Date(dailySnoozedUntil) > now;
  const weeklySnoozed = weeklySnoozedUntil && new Date(weeklySnoozedUntil) > now;

  // Logic: Show Daily if available and not snoozed and not completed.
  // Otherwise show Weekly if available and not snoozed and not completed.
  let activeChallenge: any = null;
  let challengeType: 'daily' | 'weekly' = 'daily';

  if (currentDailyChallenge && !dailySnoozed && !currentDailyChallenge.completed) {
    activeChallenge = currentDailyChallenge;
    challengeType = 'daily';
  } else if (currentChallenge && !weeklySnoozed && !currentChallenge.completed) {
    activeChallenge = currentChallenge;
    challengeType = 'weekly';
  }

  if (!activeChallenge) return null;

  const { title, description, currentCount, targetCount, xpReward } = activeChallenge;
  const progress = Math.min((currentCount / targetCount) * 100, 100);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        padding: '16px', 
        borderRadius: '16px', 
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group hover:bg-white/5 transition-colors"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            {challengeType === 'daily' ? <Zap size={10} className="text-gold" /> : <Clock size={10} className="text-gold" />}
            <span style={{ color: 'var(--gold)', fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {challengeType === 'daily' ? 'Daily Objective' : 'Weekly Milestone'}
            </span>
          </div>
          <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900 }}>+{xpReward} XP</div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              snoozeChallenge(challengeType);
            }}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[0.55rem] font-black text-white/30 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
          >
            Snooze
          </button>
        </div>
      </div>

      <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 10px rgba(255,215,0,0.3)' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.6rem', opacity: 0.3, fontWeight: 800, letterSpacing: '0.05em' }}>
        <span>{currentCount} / {targetCount}</span>
        <div className="flex items-center gap-1">
          <Info size={8} />
          <span>{isExpanded ? 'TAP TO COLLAPSE' : 'TAP FOR DETAILS'}</span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '12px', lineHeight: '1.6', marginBottom: 0 }}>
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChallengeWidget;
