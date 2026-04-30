/* src/components/NodeDossier.tsx */
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { CurriculumNode } from '../types/mastery';
import WordDetailDrawer from './WordDetailDrawer';
import VocabGrid from './VocabGrid';

interface Props {
  node: CurriculumNode;
  onBack: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export default function NodeDossier({ node, onBack, onAskLina, isSandboxMode }: Props) {
  const { vocabulary, currentPositionNodeId, checkNodeReadiness, getNodeReadinessPercentage, completedActivities, setActiveActivity } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [showInfographicModal, setShowInfographicModal] = useState(false);

  const isLocked = node.status === 'locked' && node.id !== currentPositionNodeId;

  const nodeItems = React.useMemo(() => {
    const allIds = [...node.requiredVocabIds, ...node.requiredGrammarIds];
    return vocabulary.filter(v => allIds.includes(v.id) || allIds.includes(v.word));
  }, [node, vocabulary]);

  const calculateMastery = () => {
    if (nodeItems.length === 0) {
       return node.status === 'mastered' ? 100 : 0;
    }
    const scores = nodeItems.map(word => word.baseScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length / 10);
  };

  const mastery = calculateMastery();
  const readiness = getNodeReadinessPercentage(node.id);
  const isReady = readiness >= 100 || checkNodeReadiness(node.id);
  const activities = completedActivities[node.id] || [];

  const effectiveSandbox = isSandboxMode || localStorage.getItem('tp_sandbox_mode') === 'true';

  const handlePracticeLina = () => {
    const contextStr = node.richContent?.map(c => c.content).join(' ') || '';
    const vocabStr = node.requiredVocabIds.length > 0 
      ? ` The relevant vocabulary is: ${node.requiredVocabIds.join(', ')}.` 
      : '';

    onAskLina(`[SYSTEM: Start a lesson on the concept: "${node.title}". Context: ${contextStr}${vocabStr}]`);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ 
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 5, 0.98)',
        backdropFilter: 'blur(10px)',
        zIndex: 5000,
        display: 'flex',
        flexDirection: 'column',
        padding: '30px',
        overflowY: 'auto'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <header style={{ marginBottom: '32px', flexShrink: 0 }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--gold)', 
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              padding: 0,
              letterSpacing: '0.1em'
            }}
          >
            ← RETURN TO PATHWAY
          </button>

          {isLocked && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid #ef4444', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '2.5rem' }}>🔒</span>
              <div style={{ color: '#ef4444', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.1em' }}>THIS PATH IS STILL HIDDEN</div>
              <p style={{ color: '#aaa', fontSize: '0.75rem', margin: 0, fontWeight: 500 }}>
                Reach 'Practicing' level in previous nodes to unlock.
              </p>
            </div>
          )}

          <div style={{ 
            filter: isLocked ? 'grayscale(1) opacity(0.6)' : 'none',
            pointerEvents: isLocked ? 'none' : 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '16px' }}>
              <h1 
                onClick={() => {
                  if (effectiveSandbox) {
                    useMasteryStore.getState().devUnlockNode(node.id);
                  }
                }}
                style={{ 
                  color: 'white', 
                  fontWeight: 900, 
                  fontSize: '2rem', 
                  margin: 0, 
                  letterSpacing: '-0.02em',
                  cursor: effectiveSandbox ? 'pointer' : 'default',
                  pointerEvents: 'auto' 
                }}
              >
                {node.title}
              </h1>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>NODE ID</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace' }}>{node.id.toUpperCase()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
              <div style={{ flex: 1, height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${mastery}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }} 
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 900, minWidth: '80px', textAlign: 'right' }}>{mastery}% MASTERY</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(6, 182, 212, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
              <div style={{ flex: 1, height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${readiness}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: '100%', background: '#06b6d4', boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)' }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '80px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 900 }}>{readiness}% READINESS</span>
                {isReady && (
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ background: '#22c55e', color: 'black', fontSize: '0.5rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}
                  >
                    READY TO ADVANCE!
                  </motion.span>
                )}
              </div>
            </div>

            {/* Activity Playlist */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(node.activities || []).map(activityId => (
                <button 
                  key={activityId}
                  onClick={() => setActiveActivity({ type: activityId, nodeId: node.id })}
                  className="activity-item-btn"
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '12px', 
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {activityId === 'word-scramble' ? '🧩' : (activityId === 'true-false' ? '⚖️' : (activityId === 'thought-translation' ? '💭' : '📁'))}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {activityId === 'true-false' ? 'LOGIC GATE (Endless)' : 
                         activityId === 'thought-translation' ? 'ESSENTIALIZER (Endless)' : 
                         activityId === 'drag-drop' ? 'PHILOSOPHY SORTER' :
                         activityId.toUpperCase().replace('-', ' ')}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: '#666', fontWeight: 700, letterSpacing: '0.05em' }}>
                        REQUIRED ACTIVITY (+{Math.round(30 / (node.activities?.length || 1))}% READINESS)
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!activities.some(a => a.id === activityId) && (
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em' }}>LAUNCH 🚀</div>
                    )}
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      border: `2px solid ${activities.some(a => a.id === activityId) ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: activities.some(a => a.id === activityId) ? '#22c55e' : 'transparent',
                      transition: 'all 0.3s'
                    }}>
                      {activities.some(a => a.id === activityId) && <span style={{ color: 'black', fontSize: '0.8rem', fontWeight: 900 }}>✓</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <style>{`
              .activity-item-btn:hover {
                background: rgba(255,255,255,0.05) !important;
                border-color: var(--gold) !important;
                transform: translateX(4px);
              }
              .activity-item-btn:active {
                transform: scale(0.98);
              }
            `}</style>
          </div>
        </header>

        <main style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '32px',
          filter: isLocked ? 'grayscale(1) opacity(0.6)' : 'none',
          pointerEvents: isLocked ? 'none' : 'auto'
        }}>
          <section>
            <h3 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>CURRICULUM CONTENT</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {node.richContent?.map((block, i) => (
                <div key={i}>
                  {block.type === 'text' && (
                    <p style={{ color: '#ddd', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>{block.content}</p>
                  )}
                  {block.type === 'structural' && (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.02)', 
                      borderLeft: '2px solid var(--gold)', 
                      padding: '20px',
                      borderRadius: '0 8px 8px 0',
                      marginTop: '8px'
                    }}>
                      <div style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, marginBottom: '10px', letterSpacing: '0.1em' }}>SYNTACTIC STRUCTURE</div>
                      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 500, margin: 0, fontFamily: 'serif', fontStyle: 'italic' }}>{block.content}</p>
                    </div>
                  )}
                  {block.type === 'callout' && (
                    <div style={{ 
                      background: 'rgba(251, 191, 36, 0.05)', 
                      border: '1px dashed var(--gold)', 
                      padding: '16px',
                      borderRadius: '12px',
                      marginTop: '8px'
                    }}>
                      <p style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 600, margin: 0, textAlign: 'center' }}>✦ {block.content} ✦</p>
                    </div>
                  )}
                </div>
              ))}
              {!node.richContent && <p style={{ color: '#666', fontStyle: 'italic' }}>Detailed dossier content pending decryption...</p>}
            </div>
          </section>

          {node.visualFramework && (
            <section>
              <h3 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>VISUAL ANALYTICS</h3>
              <img 
                src={node.visualFramework} 
                alt="Visual Framework" 
                style={{ 
                  width: '100%', 
                  borderRadius: '12px', 
                  border: '1px solid #333', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  display: 'block'
                }} 
              />
            </section>
          )}

          {(node.requiredVocabIds.length > 0 || node.requiredGrammarIds.length > 0) && (
            <section>
              <h3 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>NODE SANDBOX</h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.01)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <VocabGrid 
                  onAskLina={onAskLina} 
                  isSandboxMode={isSandboxMode} 
                  filterIds={[...node.requiredVocabIds, ...node.requiredGrammarIds]} 
                  hideToolbar={true}
                />
              </div>
            </section>
          )}

          {node.infographicUrl && (
            <section>
              <h3 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>ADDITIONAL TOOLS</h3>
              <button 
                onClick={() => setShowInfographicModal(true)}
                style={{ 
                  width: '100%', 
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  letterSpacing: '0.05em'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--gold)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                🖼️ VIEW INFOGRAPHIC
              </button>
            </section>
          )}

          <section style={{ marginTop: '20px', paddingBottom: '60px' }}>
            <button 
              onClick={handlePracticeLina}
              style={{ 
                width: '100%', 
                background: 'var(--gold)',
                color: 'black',
                fontWeight: 900,
                fontSize: '1.1rem',
                padding: '24px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(251, 191, 36, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '1.4rem' }}>✦</span>
              PRACTICE WITH JAN LINA
            </button>
            <p style={{ color: '#555', fontSize: '0.65rem', textAlign: 'center', marginTop: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
              START LESSON WITH jan LINA FOR INTERACTIVE ASSESSMENT
            </p>
          </section>
        </main>
      </div>

      <WordDetailDrawer
        isOpen={!!drawerId}
        word={drawerId ? vocabulary.find(v => v.id === drawerId) ?? null : null}
        onClose={() => setDrawerId(null)}
        onAskLina={onAskLina}
        isSandboxMode={isSandboxMode}
      />

      <AnimatePresence>
        {showInfographicModal && node.infographicUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfographicModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              cursor: 'zoom-out'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                position: 'relative',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <img
                src={node.infographicUrl}
                alt="Infographic"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 120px)',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setShowInfographicModal(false); }}
                style={{
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '100px',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

