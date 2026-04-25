import { useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import DailyReviewWidget from './widgets/DailyReviewWidget';
import RoadmapWidget from './widgets/RoadmapWidget';
import VocabWing from './widgets/VocabWing';
import PhraseWing from './widgets/PhraseWing';
import LiveTile from './LiveTile';

import UserProfilePanel from './UserProfilePanel';
import SettingsPanel from './SettingsPanel';
import InstructionsPanel from './InstructionsPanel';
import AchievementsPanel from './AchievementsPanel';
import ChatSession from './ChatSession';

import type { AppPanel } from '../App';

interface Props {
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function MosaicGrid({ onAskLina, isSandboxMode, setIsSandboxMode }: Props) {
  const controls = useAnimation();
  const { 
    vocabulary, levels, reviewVibe, 
    fogOfWar, showCircuitPaths 
  } = useMasteryStore();

  const [expandedTile, setExpandedTile] = useState<AppPanel | 'roadmap' | 'review' | string | null>(null);

  const handleDragEnd = (event: any, info: any) => {
    const { offset, velocity } = info;
    const threshold = 150;

    let targetX = 0;
    // We start at x: 0 (center spine)
    // Left Wing (Vocab) is at x: 100vw
    // Right Wing (Phrases) is at x: -100vw

    if (offset.x > threshold || velocity.x > 500) targetX = window.innerWidth;
    else if (offset.x < -threshold || velocity.x < -500) targetX = -window.innerWidth;

    controls.start({
      x: targetX,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    });
  };

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
    <div style={{ 
      width: '100vw', height: '100vh', overflow: 'hidden', 
      position: 'relative', background: '#020202' 
    }}>
      {/* SVG CONNECTIONS (CIRCUIT PATHS) */}
      {showCircuitPaths && (
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.1, zIndex: 1 }}>
          <motion.path 
            d="M -100 500 Q 500 400 1100 500 T 2100 500" 
            stroke="var(--gold)" 
            strokeWidth="1" 
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle 
            r="2" 
            fill="var(--gold)"
            animate={{ 
              offsetDistance: ["0%", "100%"],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ offsetPath: "path('M -100 500 Q 500 400 1100 500 T 2100 500')" }}
          />
        </svg>
      )}

      <motion.div
        drag="x"
        onDragEnd={handleDragEnd}
        animate={{
          ...controls,
          scale: expandedTile ? 0.95 : 1,
          opacity: expandedTile ? 0.4 : 1,
          filter: expandedTile ? 'blur(4px)' : 'blur(0px)'
        }}
        style={{
          width: '300vw',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: '-100vw',
          display: 'flex',
          zIndex: 2,
          cursor: 'grab'
        }}
      >
        {/* LEFT WING: VOCAB */}
        <div style={{ width: '100vw', height: '100vh', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <VocabWing />
        </div>

        {/* CENTER SPINE */}
        <div style={{ 
          width: '100vw', height: '100vh', overflowY: 'auto', 
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '100px 0', gap: '40px', scrollSnapType: 'y mandatory'
        }}>
          <div style={{ scrollSnapAlign: 'center' }}>
            <DailyReviewWidget onStartReview={handleDailyReview} />
          </div>

          <div style={{ scrollSnapAlign: 'center' }}>
            <RoadmapWidget onClick={() => setExpandedTile('roadmap')} />
          </div>

          {/* CURRICULUM NODES IN SPINE */}
          <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {levels.map(level => (
               <div key={level.id} style={{ opacity: fogOfWar === 'Strict' && level.nodes.every(n => n.status === 'locked') ? 0 : 1 }}>
                 <h4 style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900, marginBottom: '10px' }}>
                   {level.title.toUpperCase()}
                 </h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {level.nodes.map(node => (
                     <div 
                        key={node.id} 
                        style={{ 
                          padding: '16px', 
                          background: node.status === 'mastered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${node.status === 'active' ? 'var(--gold)' : 'var(--border)'}`,
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: node.status === 'locked' ? 0.4 : 1,
                          filter: node.status === 'locked' && fogOfWar === 'Visible' ? 'grayscale(1)' : 'none'
                        }}
                     >
                       <span style={{ fontWeight: 800 }}>{node.title}</span>
                       <span style={{ fontSize: '0.7rem', fontWeight: 900, color: node.status === 'active' ? 'var(--gold)' : 'inherit' }}>
                         {node.status.toUpperCase()}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>

          {/* UTILITY TILES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', width: '100%', maxWidth: '700px' }}>
             <LiveTile size="1x1" status="introduced" onClick={() => setExpandedTile('settings')}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '2rem' }}>⚙️</span>
                  <span style={{ fontWeight: 900, fontSize: '0.6rem' }}>SETTINGS</span>
                </div>
             </LiveTile>
             <LiveTile size="1x1" status="confident" onClick={() => setExpandedTile('profile')}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '2rem' }}>👤</span>
                  <span style={{ fontWeight: 900, fontSize: '0.6rem' }}>PROFILE</span>
                </div>
             </LiveTile>
             <LiveTile size="2x1" status="not_started" onClick={() => setExpandedTile('instructions')}>
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>❓</span>
                  <span style={{ fontWeight: 800 }}>PROTOCOLS</span>
                </div>
             </LiveTile>
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

        {/* RIGHT WING: PHRASEBOOK */}
        <div style={{ width: '100vw', height: '100vh', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <PhraseWing />
        </div>
      </motion.div>

      {/* EXPANDED MODALS (LAYERED DEPTH) */}
      <AnimatePresence>
        {expandedTile && expandedTile !== 'chat' && (
          <ModalWrapper onClose={() => setExpandedTile(null)}>
            {expandedTile === 'profile' && <UserProfilePanel isOpen={true} onClose={() => setExpandedTile(null)} />}
            {expandedTile === 'settings' && <SettingsPanel isOpen={true} onClose={() => setExpandedTile(null)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
            {expandedTile === 'achievements' && <AchievementsPanel onClose={() => setExpandedTile(null)} />}
            {expandedTile === 'instructions' && <InstructionsPanel isOpen={true} onClose={() => setExpandedTile(null)} />}
            {expandedTile === 'roadmap' && (
               <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
                  <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '20px' }}>NEURAL PATHWAY ROADMAP</h1>
                  {levels.map(level => (
                    <div key={level.id} style={{ marginBottom: '30px' }}>
                      <h2 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>{level.title}</h2>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {level.nodes.map(m => (
                          <div key={m.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{m.title}</span>
                            <span style={{ color: m.status === 'active' ? 'var(--gold)' : 'inherit', fontWeight: 800 }}>{m.status.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
            )}
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* CHAT FAB */}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ 
        width: '100%', maxWidth: '800px', maxHeight: '90vh', 
        overflow: 'hidden', position: 'relative',
        background: '#0a0a0a', border: '1px solid var(--border)',
        borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {children}
      </div>
    </motion.div>
  );
}
