/* src/components/OperationalIntelligenceWidget.tsx */
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onAskLina: (prompt: string) => void;
  onOpenAchievements: () => void;
}

const STATUS_COLORS: Record<MasteryStatus, string> = {
  not_started: '#222',
  introduced: '#3b82f6',
  practicing: '#f59e0b',
  confident: '#10b981',
  mastered: 'var(--gold)',
};

const NEXT_THRESHOLDS: Record<string, number> = {
  not_started: 201,
  introduced: 501,
  practicing: 751,
  confident: 950,
};

export default function OperationalIntelligenceWidget({ onAskLina, onOpenAchievements }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { vocabulary, curriculums, getStatusSummary } = useMasteryStore();
  const summary = getStatusSummary();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const totalWords = vocabulary.length;
  
  // Bleeding words
  const bleedingWords = useMemo(() => 
    vocabulary.filter(w => w.isBleeding), 
  [vocabulary]);

  // Ready to level words
  const readyToLevelWords = useMemo(() => {
    return vocabulary.filter(w => {
      if (w.status === 'mastered') return false;
      const threshold = NEXT_THRESHOLDS[w.status];
      return threshold && (threshold - w.baseScore <= 100);
    });
  }, [vocabulary]);

  // Curriculum nodes
  const visibleNodes = useMemo(() => {
    const allNodes = curriculums.flatMap(c => c.nodes);
    return allNodes.slice(0, 8);
  }, [curriculums]);

  return (
    <div className="oi-widget" style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Collapsed State: Segmented Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100px', 
          height: '8px', 
          background: '#111', 
          borderRadius: '4px', 
          display: 'flex', 
          overflow: 'hidden', 
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        {(['not_started', 'introduced', 'practicing', 'confident', 'mastered'] as MasteryStatus[]).map(status => {
          const count = summary[status] || 0;
          const width = totalWords > 0 ? (count / totalWords) * 100 : 0;
          return (
            <div 
              key={status}
              style={{ 
                width: `${width}%`, 
                height: '100%', 
                background: STATUS_COLORS[status],
                transition: 'width 0.5s ease'
              }}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              top: '20px',
              left: '0',
              width: '320px',
              background: '#0a0a0a',
              border: '1px solid #222',
              borderRadius: '8px',
              padding: '16px',
              zIndex: 1000,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Section 1: Bleeding */}
            <section>
              <h3 style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '10px' }}>🩸 NEEDS ATTENTION</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {bleedingWords.length > 0 ? bleedingWords.map(w => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>{w.word}</span>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[w.status] }} />
                    </div>
                    <button 
                      onClick={() => { onAskLina(`Let's review the word: ${w.word}`); setIsOpen(false); }}
                      style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', padding: '4px 8px' }}
                    >
                      ASK LINA
                    </button>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.75rem', color: '#444', fontStyle: 'italic' }}>No words in distress.</div>
                )}
              </div>
            </section>

            {/* Section 2: Ready to Level */}
            <section>
              <h3 style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '10px' }}>⬆️ READY TO ADVANCE</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {readyToLevelWords.length > 0 ? readyToLevelWords.map(w => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>{w.word}</span>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[w.status] }} />
                    </div>
                    <button 
                      onClick={() => { onAskLina(`Let's review the word: ${w.word}`); setIsOpen(false); }}
                      style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', padding: '4px 8px' }}
                    >
                      ASK LINA
                    </button>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.75rem', color: '#444', fontStyle: 'italic' }}>All words holding steady.</div>
                )}
              </div>
            </section>

            {/* Section 3: Curriculum Status */}
            <section>
              <h3 style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '10px' }}>🗺️ CURRICULUM STATUS</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {visibleNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600 }}>{node.title}</span>
                    <span style={{ 
                      fontSize: '0.5rem', 
                      fontWeight: 900, 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: node.status === 'locked' ? '#222' : node.status === 'active' ? 'var(--gold)' : '#10b981',
                      color: node.status === 'active' ? 'black' : 'white'
                    }}>
                      {node.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <footer style={{ borderTop: '1px solid #222', paddingTop: '12px', textAlign: 'center' }}>
              <button 
                onClick={() => { onOpenAchievements(); setIsOpen(false); }}
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.05em' }}
              >
                VIEW FULL REPORT →
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
