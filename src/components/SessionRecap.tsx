import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_META, type MasteryStatus, type SmallRank, type CeremonialRank } from '../types/mastery';

interface SessionRecapProps {
  sessionTitle: string;
  totalXPEarned: number;
  prevTotalXP: number;
  xpMultiplier: number;
  wordsMoved: { word: string; oldStatus: MasteryStatus; newStatus: MasteryStatus; hardened?: boolean; roleMastered?: boolean }[];
  wordOfTheSession: { word: string; newStatus: MasteryStatus; note: string } | null;
  newRankUnlocked: SmallRank | CeremonialRank | null;
  isPersonalBest: boolean;
  streak: number;
  shieldsRemaining: number;
  onContinue: () => void;
}

const SessionRecap: React.FC<SessionRecapProps> = ({
  sessionTitle,
  totalXPEarned,
  prevTotalXP,
  xpMultiplier,
  wordsMoved,
  wordOfTheSession,
  newRankUnlocked,
  isPersonalBest,
  streak,
  shieldsRemaining,
  onContinue
}) => {
  const [displayXP, setDisplayXP] = useState(prevTotalXP);

  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const now = Date.now();
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(prevTotalXP + (totalXPEarned * progress));
      setDisplayXP(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [prevTotalXP, totalXPEarned]);

  const getGrade = () => {
    if (totalXPEarned > 500 || wordsMoved.some(w => w.newStatus === 'mastered')) return 'S';
    if (totalXPEarned > 250) return 'A';
    if (totalXPEarned > 100) return 'B';
    if (totalXPEarned > 0) return 'C';
    return null;
  };

  const grade = getGrade();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      overflowY: 'auto',
      color: 'white',
      fontFamily: 'inherit'
    }}>
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ color: 'var(--gold)', fontSize: '2rem', fontWeight: 900, marginBottom: '8px', textAlign: 'center' }}
      >
        SESSION COMPLETE
      </motion.h1>
      <p style={{ opacity: 0.7, marginBottom: '40px', fontSize: '0.9rem' }}>{sessionTitle}</p>

      {/* Grade */}
      {grade && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.5 }}
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            width: '80px',
            height: '80px',
            border: '4px solid var(--gold)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 900,
            color: 'var(--gold)',
            boxShadow: '0 0 20px rgba(255, 191, 0, 0.3)'
          }}
        >
          {grade}
        </motion.div>
      )}

      {/* XP Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>
          {displayXP} <span style={{ fontSize: '1rem', color: 'var(--gold)' }}>XP</span>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: 'var(--gold)', fontWeight: 800 }}
        >
          +{totalXPEarned} XP {isPersonalBest && <span style={{ background: 'var(--gold)', color: 'black', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', fontSize: '0.7rem' }}>NEW PERSONAL BEST</span>}
        </motion.div>
        {xpMultiplier > 1.0 && (
          <div style={{ fontSize: '0.8rem', marginTop: '8px', color: '#ff4d4d', fontWeight: 900 }}>
            🔥 {xpMultiplier}x STREAK BONUS
          </div>
        )}
      </div>

      {/* Highlights */}
      <div style={{ width: '100%', maxWidth: '500px', display: 'grid', gap: '24px' }}>
        
        {wordOfTheSession && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid var(--gold)', padding: '20px', borderRadius: '8px' }}
          >
            <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--gold)', margin: '0 0 12px 0' }}>WORD OF THE SESSION</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{wordOfTheSession.word}</span>
              <span style={{ fontSize: '1.2rem' }}>{STATUS_META[wordOfTheSession.newStatus].emoji}</span>
            </div>
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.9, margin: 0 }}>"{wordOfTheSession.note}"</p>
          </motion.div>
        )}

        {wordsMoved.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.5, margin: '0 0 16px 0' }}>MASTERY MOVEMENT</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {wordsMoved.map(w => (
                <div key={w.word} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800 }}>{w.word}</span>
                    {w.hardened && <span>🛡️</span>}
                    {w.roleMastered && <span>🎭</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ opacity: 0.4 }}>{STATUS_META[w.oldStatus].emoji}</span>
                    <span style={{ opacity: 0.4 }}>→</span>
                    <span>{STATUS_META[w.newStatus].emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {newRankUnlocked && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ 
                background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
                border: '2px solid var(--gold)',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(255,191,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', animation: 'shimmer 2s infinite' }} />
              <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', margin: '0 0 8px 0' }}>NEW RANK UNLOCKED</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>{newRankUnlocked.title}</div>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>{'description' in newRankUnlocked ? newRankUnlocked.description : 'Higher XP reached'}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', opacity: 0.6, fontSize: '0.8rem' }}>
          <div>STREAK: <strong>{streak} days</strong></div>
          <div>SHIELDS: <strong>{shieldsRemaining} / 2</strong></div>
          <div>XP BONUS: <strong>{xpMultiplier}x</strong></div>
        </div>

      </div>

      <button type="button" 
        onClick={onContinue}
        style={{
          marginTop: 'auto',
          padding: '16px 60px',
          background: 'var(--gold)',
          color: 'black',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 900,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        CONTINUE
      </button>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SessionRecap;
