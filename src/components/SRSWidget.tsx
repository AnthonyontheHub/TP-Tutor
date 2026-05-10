import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { type MasteryStatus } from '../types/mastery';

interface Props {
  onAskLina: (prompt: string) => void;
  onSnooze: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  introduced: '#a855f7',
  practicing: '#3b82f6',
  confident: '#eab308',
  mastered: '#22c55e',
};

const INTERVALS: Record<MasteryStatus, number> = {
  not_started: Infinity,
  introduced: 1,
  practicing: 3,
  confident: 7,
  mastered: 21,
};

export default function SRSWidget({ onAskLina, onSnooze }: Props) {
  const { vocabulary, getDueWords } = useMasteryStore();
  
  const dueWords = useMemo(() => getDueWords(), [vocabulary, getDueWords]);
  const totalDueCount = dueWords.length;

  const handleStartReview = () => {
    if (totalDueCount === 0) return;
    const wordList = dueWords.map(w => w.word).join(', ');
    const prompt = `[SYSTEM: SRS Review session. The following words are due for review based on spaced repetition intervals: ${wordList}. Quiz the student on each word. Prioritize production over recognition. Update mastery status based on performance.]`;
    onAskLina(prompt);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 className="section-title" style={{ margin: 0, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            REVIEW QUEUE
          </h3>
          <button 
            onClick={onSnooze}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border)', 
              color: '#888', 
              fontSize: '0.55rem', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 800
            }}
          >
            SNOOZE 4H
          </button>
        </div>
        <div style={{ 
          background: totalDueCount > 0 ? 'var(--gold)' : 'transparent',
          color: totalDueCount > 0 ? 'black' : 'var(--text-muted)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '0.7rem',
          fontWeight: 900,
          border: totalDueCount > 0 ? 'none' : '1px solid var(--border)'
        }}>
          {totalDueCount}
        </div>
      </header>

      {totalDueCount === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>
          <span style={{ color: '#22c55e' }}>✓</span> No words due for review. pona!
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto', 
            paddingBottom: '12px',
            marginBottom: '12px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {dueWords.slice(0, 5).map(word => {
              const now = new Date();
              const last = new Date(word.lastReviewed || 0);
              const interval = INTERVALS[word.status] || 1;
              const dueDate = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);
              const overdueMs = now.getTime() - dueDate.getTime();
              const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
              const overdueStr = overdueDays === 0 ? "due today" : `${overdueDays}d overdue`;

              return (
                <div key={word.id} style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)',
                  minWidth: '100px',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLORS[word.status] }} />
                    <span style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{word.word}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{overdueStr}</div>
                </div>
              );
            })}
            {totalDueCount > 5 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--text-muted)', 
                fontSize: '0.75rem',
                padding: '0 10px',
                fontWeight: 700
              }}>
                +{totalDueCount - 5} more
              </div>
            )}
          </div>

          <button 
            className="btn-review" 
            onClick={handleStartReview}
            style={{ width: '100%', margin: 0, padding: '10px' }}
          >
            START REVIEW
          </button>
        </>
      )}
    </div>
  );
}
