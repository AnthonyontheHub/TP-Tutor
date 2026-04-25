/* src/components/MosaicGrid.tsx */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import LiveTile from './LiveTile';
import VocabCard from './VocabCard';
import PhraseGrid from './PhraseGrid';
import ProgressSummary from './ProgressSummary';
import UserProfilePanel from './UserProfilePanel';
import SettingsPanel from './SettingsPanel';
import InstructionsPanel from './InstructionsPanel';
import AchievementsPanel from './AchievementsPanel';
import ChatSession from './ChatSession';
import type { AppPanel } from '../App';
import type { MasteryStatus, VocabWord } from '../types/mastery';

interface Props {
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

const GUTTER = 16;
const TILE_SIZE = 160;

export default function MosaicGrid({ onAskLina, isSandboxMode, setIsSandboxMode }: Props) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    studentName, vocabulary, concepts, savedPhrases, 
    activeCurriculumId, activeModuleId, curriculums,
    reviewVibe, setReviewVibe
  } = useMasteryStore();

  const [expandedTile, setExpandedTile] = useState<AppPanel | 'roadmap' | 'review' | string | null>(null);

  // SNAP ZONES
  // Center: (0, 0)
  // Left (Vocab): (100vw, 0) -> we pull the grid right
  // Right (Phrases): (-100vw, 0) -> we pull the grid left
  // Bottom (Achievements): (0, -100vh) -> we pull the grid up

  const handleDragEnd = (event: any, info: any) => {
    const { offset } = info;
    const threshold = 150;

    let targetX = 0;
    let targetY = 0;

    if (offset.x > threshold) targetX = window.innerWidth;
    else if (offset.x < -threshold) targetX = -window.innerWidth;

    if (offset.y < -threshold) targetY = -window.innerHeight;

    controls.start({
      x: targetX,
      y: targetY,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    });
  };

  const calculateProgress = () => {
    const totalItems = vocabulary.length + concepts.length;
    const masteredItems = vocabulary.filter(v => v.status === 'mastered').length + 
                         concepts.filter(c => c.status === 'mastered').length;
    return Math.round((masteredItems / totalItems) * 100);
  };

  const activeCurriculum = curriculums.find(c => c.id === activeCurriculumId);
  const progress = calculateProgress();

  const handleDailyReview = () => {
    let targetWords: string[] = [];
    if (reviewVibe === 'chill') {
      targetWords = vocabulary
        .filter(w => w.status === 'confident' || w.status === 'mastered')
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 8)
        .map(w => w.word);
    } else {
      targetWords = vocabulary
        .filter(w => w.status === 'introduced' || w.status === 'not_started')
        .sort((a, b) => (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999))
        .slice(0, 6)
        .map(w => w.word);
    }

    if (targetWords.length === 0) {
      onAskLina(`toki jan Lina! I'm in ${reviewVibe} mode but I have no words that fit that criteria.`);
      return;
    }
    onAskLina(`toki jan Lina! Let's do a daily review in **${reviewVibe.toUpperCase()}** mode. Focus on these words: ${targetWords.join(', ')}.`);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#050505' }}>
      <motion.div
        drag
        dragConstraints={{ left: -window.innerWidth, right: window.innerWidth, top: -window.innerHeight, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{
          ...controls,
          scale: expandedTile ? 0.95 : 1,
          opacity: expandedTile ? 0.3 : 1,
          filter: expandedTile ? 'blur(10px)' : 'blur(0px)'
        }}
        style={{
          width: '300vw',
          height: '200vh',
          position: 'absolute',
          top: 0,
          left: '-100vw',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          cursor: 'grab'
        }}
      >
        {/* LEFT WING: VOCAB GRID */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: GUTTER, 
            maxHeight: '90vh', 
            overflowY: 'auto',
            paddingRight: '20px'
          }}>
            <h2 className="section-title" style={{ gridColumn: 'span 6' }}>NEURAL MAP: VOCABULARY</h2>
            {vocabulary.map(v => (
              <LiveTile key={v.id} size="1x1" status={v.status}>
                <VocabCard word={v} />
              </LiveTile>
            ))}
            {concepts.map(c => (
              <LiveTile key={c.id} size="2x1" status={c.status} variant="grammar">
                <div style={{ padding: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: 900 }}>CONCEPT</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.title}</div>
                </div>
              </LiveTile>
            ))}
          </div>
        </div>

        {/* CENTER: CORE TILES */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: GUTTER }}>
            <LiveTile size="2x1" status="mastered" onClick={handleDailyReview}>
               <div style={{ padding: '20px', background: 'var(--gold)', color: 'black', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>DAILY REVIEW</div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>SYNC NEURAL PATHWAYS</div>
               </div>
            </LiveTile>

            <LiveTile size="2x2" status="practicing" onClick={() => setExpandedTile('roadmap')}>
              <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 900 }}>CURRICULUM ROADMAP</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{activeCurriculum?.title || 'Basics'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold)' }}>{progress}%</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6 }}>COMPLETE</div>
                </div>
              </div>
            </LiveTile>

            <LiveTile size="1x1" status="introduced" onClick={() => setExpandedTile('settings')}>
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>⚙️</div>
            </LiveTile>
            <LiveTile size="1x1" status="confident" onClick={() => setExpandedTile('profile')}>
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
            </LiveTile>
            <LiveTile size="2x1" status="not_started" onClick={() => setExpandedTile('instructions')}>
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>❓</span>
                <span style={{ fontWeight: 800 }}>PROTOCOLS</span>
              </div>
            </LiveTile>
          </div>
        </div>

        {/* RIGHT WING: PHRASEBOOK */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: GUTTER }}>
            <h2 className="section-title" style={{ gridColumn: 'span 2' }}>PHRASEBOOK: SAVED LINKAGES</h2>
            {savedPhrases.slice(0, 4).map((p, i) => (
              <LiveTile key={i} size="2x1" status="mastered">
                <div style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {typeof p === 'string' ? p : p.tp}
                </div>
              </LiveTile>
            ))}
          </div>
        </div>

        {/* BOTTOM LEFT: (EMPTY) */}
        <div></div>

        {/* BOTTOM CENTER: ACHIEVEMENTS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: GUTTER }}>
            <h2 className="section-title" style={{ gridColumn: 'span 2' }}>BREAKTHROUGH LOGS</h2>
            <LiveTile size="2x1" status="confident" onClick={() => setExpandedTile('achievements')}>
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>🏆</span>
                <div>
                  <div style={{ fontWeight: 900 }}>ACHIEVEMENTS</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>VIEW MILESTONES</div>
                </div>
              </div>
            </LiveTile>
          </div>
        </div>

        {/* BOTTOM RIGHT: (EMPTY) */}
        <div></div>
      </motion.div>

      <AnimatePresence>
        {expandedTile === 'profile' && (
          <ModalWrapper onClose={() => setExpandedTile(null)}>
            <UserProfilePanel isOpen={true} onClose={() => setExpandedTile(null)} />
          </ModalWrapper>
        )}
        {expandedTile === 'settings' && (
          <ModalWrapper onClose={() => setExpandedTile(null)}>
            <SettingsPanel isOpen={true} onClose={() => setExpandedTile(null)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
          </ModalWrapper>
        )}
        {expandedTile === 'achievements' && (
          <ModalWrapper onClose={() => setExpandedTile(null)}>
            <AchievementsPanel onClose={() => setExpandedTile(null)} />
          </ModalWrapper>
        )}
        {expandedTile === 'instructions' && (
          <ModalWrapper onClose={() => setExpandedTile(null)}>
            <InstructionsPanel isOpen={true} onClose={() => setExpandedTile(null)} />
          </ModalWrapper>
        )}
        {expandedTile === 'roadmap' && (
          <ModalWrapper onClose={() => setExpandedTile(null)}>
            <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
              <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '20px' }}>NEURAL PATHWAY ROADMAP</h1>
              {curriculums.map(c => (
                <div key={c.id} style={{ marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>{c.title}</h2>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {c.modules.map(m => (
                      <div key={m.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{m.title}</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>LOCKED</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* CHAT FAB (ALWAYS ACCESSIBLE) */}
      <button 
        onClick={() => setExpandedTile('chat')}
        style={{
          position: 'fixed', bottom: '30px', right: '30px',
          width: '60px', height: '60px', borderRadius: '30px',
          background: 'var(--gold)', border: 'none', color: 'black',
          fontSize: '1.5rem', fontWeight: 900, boxShadow: '0 0 20px var(--gold-glow)',
          zIndex: 100, cursor: 'pointer'
        }}
      >💬</button>

      <AnimatePresence>
        {expandedTile === 'chat' && (
          <ModalWrapper onClose={() => setExpandedTile(null)}>
             <ChatSession isActive={true} onEndSession={() => setExpandedTile(null)} isSandboxMode={isSandboxMode} />
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '800px', height: '90vh', overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </motion.div>
  );
}
