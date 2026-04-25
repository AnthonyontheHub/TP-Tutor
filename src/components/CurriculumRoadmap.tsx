/* src/components/CurriculumRoadmap.tsx */
import { useState, useMemo } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import NodeDossier from './NodeDossier';
import type { CurriculumNode } from '../types/mastery';

interface Props {
  onSetActiveView: (view: 'vocab' | 'roadmap' | 'phrasebook') => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export default function CurriculumRoadmap({ onSetActiveView, onAskLina, isSandboxMode }: Props) {
  const { levels, vocabulary, currentPositionNodeId } = useMasteryStore();
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);

  // Flatten all nodes into a single sequence for the winding path
  const allNodes = useMemo(() => {
    return levels.flatMap(level => level.nodes);
  }, [levels]);

  const calculateNodeMastery = (requiredVocabIds: string[], requiredGrammarIds: string[]) => {
    const allIds = [...requiredVocabIds, ...requiredGrammarIds];
    if (allIds.length === 0) return 0;

    const scores = allIds.map(id => {
      const word = vocabulary.find(v => v.id === id || v.word === id);
      return word ? word.baseScore : 0;
    });

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(average);
  };

  const getMasteryColor = (score: number) => {
    if (score >= 950) return '#22c55e'; // Mastered: Bright Green
    if (score >= 751) return '#eab308'; // Confident: Yellow
    if (score >= 501) return '#3b82f6'; // Practicing: Blue
    if (score >= 201) return '#a855f7'; // Introduced: Purple
    return '#444'; // Not started
  };

  const handleNodeClick = (node: CurriculumNode) => {
    setSelectedNode(node);
  };

  // Helper to get winding offset (Duolingo style)
  const getWindingOffset = (index: number) => {
    const cycle = index % 4;
    switch (cycle) {
      case 0: return '0%';
      case 1: return '25%';
      case 2: return '0%';
      case 3: return '-25%';
      default: return '0%';
    }
  };

  return (
    <div className="roadmap-container" style={{ 
      padding: '40px 0', 
      paddingBottom: '150px', 
      position: 'relative',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <AnimatePresence>
        {selectedNode && (
          <NodeDossier 
            node={selectedNode} 
            onBack={() => setSelectedNode(null)} 
            onAskLina={onAskLina}
            onSetActiveView={onSetActiveView}
            isSandboxMode={isSandboxMode}
          />
        )}
      </AnimatePresence>

      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.2em', margin: 0 }}>NEURAL PATHWAY</h1>
        <p style={{ color: '#666', fontSize: '0.7rem', fontWeight: 800, marginTop: '8px' }}>SEQUENTIAL MASTERY MAP</p>
      </header>
      
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
        {/* SVG Path Connector (Optional decoration) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
           {/* We can add a winding line here if needed */}
        </svg>

        {allNodes.map((node, index) => {
          const mastery = calculateNodeMastery(node.requiredVocabIds || [], node.requiredGrammarIds || []);
          const isLocked = node.status === 'locked';
          const isMastered = node.status === 'mastered';
          const isActive = node.status === 'active';
          const isCurrent = node.id === currentPositionNodeId;

          const masteryColor = getMasteryColor(mastery);
          const xOffset = getWindingOffset(index);

          return (
            <div 
              key={node.id} 
              style={{ 
                position: 'relative', 
                zIndex: 1, 
                left: xOffset,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <motion.button
                whileHover={isLocked ? {} : { scale: 1.1 }}
                whileTap={isLocked ? {} : { scale: 0.9 }}
                onClick={() => !isLocked && handleNodeClick(node)}
                disabled={isLocked}
                style={{
                  width: isCurrent ? '80px' : '64px',
                  height: isCurrent ? '80px' : '64px',
                  borderRadius: '50%',
                  background: isLocked ? '#222' : (isMastered ? 'var(--gold)' : '#333'),
                  border: isCurrent ? '4px solid white' : `2px solid ${isLocked ? '#333' : 'var(--gold)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isLocked ? 'default' : 'pointer',
                  boxShadow: isCurrent ? '0 0 20px var(--gold)' : 'none',
                  position: 'relative'
                }}
              >
                {isLocked ? (
                  <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>🔒</span>
                ) : (
                  <span style={{ fontSize: '1.5rem', filter: isMastered ? 'none' : 'grayscale(1)' }}>
                    {node.type === 'Checkpoint' ? '🏁' : (node.type === 'Drill' ? '⚡' : '🧠')}
                  </span>
                )}

                {/* Mastery Ring */}
                {!isLocked && (
                  <svg style={{ position: 'absolute', inset: -6, width: 'calc(100% + 12px)', height: 'calc(100% + 12px)', transform: 'rotate(-90deg)' }}>
                    <circle 
                      cx="50%" cy="50%" r="48%" 
                      fill="none" 
                      stroke={masteryColor} 
                      strokeWidth="3" 
                      strokeDasharray="100 100" 
                      strokeDashoffset={100 - (mastery / 10)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                )}
              </motion.button>

              <div style={{ 
                marginTop: '12px', 
                textAlign: 'center', 
                width: '120px',
                opacity: isLocked ? 0.4 : 1
              }}>
                <div style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 900, 
                  color: isCurrent ? 'white' : '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {node.title}
                </div>
                {isMastered && (
                  <div style={{ fontSize: '0.5rem', color: 'var(--green)', fontWeight: 800, marginTop: '2px' }}>COMPLETE</div>
                )}
                {isActive && !isCurrent && (
                  <div style={{ fontSize: '0.5rem', color: 'var(--gold)', fontWeight: 800, marginTop: '2px' }}>READY</div>
                )}
                {isCurrent && (
                  <div style={{ fontSize: '0.5rem', color: 'var(--gold)', fontWeight: 800, marginTop: '2px' }}>CURRENT</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
