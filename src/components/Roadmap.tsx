/* src/components/Roadmap.tsx */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import NodeDossier from './NodeDossier';
import ChallengeWidget from './ChallengeWidget';
import type { CurriculumNode, SessionLogEntry, ReviewVibe } from '../types/mastery';
import { Crown, Map, Lock, Sparkles, Brain, Zap } from 'lucide-react';

interface Props {
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export function getRoadmapLessonPrompt(curriculums: any[], currentPositionNodeId: string, reviewVibe: ReviewVibe | null) {
  const activeNode = curriculums.flatMap(l => l.nodes).find(n => n.id === currentPositionNodeId);
  const nodeTitle = activeNode?.title || 'Current Module';

  if (reviewVibe === 'chill') {
    return `[SYSTEM: Roadmap Lesson - NEW CONCEPT. Focus strictly on current module items for "${nodeTitle}".]`;
  } else if (reviewVibe === 'deep') {
    return `[SYSTEM: Roadmap Lesson - REVIEW. Mix items from "${nodeTitle}" with previously introduced words.]`;
  } else if (reviewVibe === 'intense') {
    return `[SYSTEM: Roadmap Lesson - QUIZ / LEVEL UP. Conduct a proficiency test on the current module "${nodeTitle}".]`;
  } else {
    return `[SYSTEM: Roadmap Lesson. Continue "${nodeTitle}" with a mix of new material and past review.]`;
  }
}

export default function Roadmap({ onAskLina, isSandboxMode }: Props) {
  const { curriculums, currentPositionNodeId, sessionLog, vocabulary, fogOfWar, showCircuitPaths } = useMasteryStore();
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const [hoveredSession, setHoveredSession] = useState<SessionLogEntry | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const currentPositionRef = useRef<HTMLDivElement>(null);

  const globalMastery = useMemo(() => {
    if (vocabulary.length === 0) return 0;
    const totalPoints = vocabulary.reduce((acc, word) => {
      let score = word.baseScore;
      if (word.status !== 'not_started') score = Math.min(1000, score + 100);
      return acc + score;
    }, 0);
    return Math.round((totalPoints / (vocabulary.length * 1000)) * 100);
  }, [vocabulary]);

  useEffect(() => {
    if (currentPositionRef.current) {
      currentPositionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const allNodes = useMemo(() => curriculums.flatMap(level => level.nodes), [curriculums]);

  const getWindingOffset = (index: number) => {
    const cycle = index % 4;
    switch (cycle) {
      case 0: return 0;
      case 1: return 80;
      case 2: return 0;
      case 3: return -80;
      default: return 0;
    }
  };

  const handleNodeClick = (node: CurriculumNode) => {
    const isCurrent = node.id === currentPositionNodeId;
    const isLocked = node.status === 'locked' && !isCurrent;
    if (isLocked && fogOfWar === 'Strict') return;
    setSelectedNode(node);
  };

  return (
    <div className="roadmap-viewport" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes circuitPulse {
          0% { stroke-dashoffset: 100; opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { stroke-dashoffset: 0; opacity: 0.3; }
        }
        .circuit-path {
          stroke-dasharray: 10;
          animation: circuitPulse 3s linear infinite;
        }
        .node-active-glow {
          box-shadow: 0 0 25px var(--gold-glow), inset 0 0 15px var(--gold-glow);
        }
        .node-mastered-glow {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2), inset 0 0 10px rgba(34, 197, 94, 0.1);
        }
      `}</style>

      <AnimatePresence>
        {selectedNode && (
          <div className="modal-backdrop" style={{ zIndex: 5000 }} onClick={() => setSelectedNode(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px' }}>
              <NodeDossier 
                node={selectedNode} 
                onBack={() => setSelectedNode(null)} 
                onAskLina={onAskLina}
                isSandboxMode={isSandboxMode}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <div ref={containerRef} style={{ 
        padding: '60px 0 200px', 
        maxWidth: '600px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        
        <header style={{ textAlign: 'center', marginBottom: '80px', width: '100%', padding: '0 20px' }}>
          <h1 style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '24px' }}>Neural Circuitry</h1>
          
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '0.15em' }}>OVERALL SYNC</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 900 }}>{globalMastery}%</span>
            </div>
            <div className="glass-panel" style={{ height: '8px', padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${globalMastery}%` }}
                transition={{ duration: 2, ease: "circOut" }}
                style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 15px var(--gold)' }} 
              />
            </div>
          </div>
        </header>

        <div style={{ position: 'relative', width: '100%' }}>
          {/* SVG Connections Layer */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            {allNodes.map((node, i) => {
              if (i === allNodes.length - 1) return null;
              const x1 = 300 + getWindingOffset(i);
              const y1 = i * 140 + 40;
              const x2 = 300 + getWindingOffset(i + 1);
              const y2 = (i + 1) * 140 + 40;
              
              const isFlowing = node.status === 'mastered' && showCircuitPaths;
              
              return (
                <path 
                  key={`path-${i}`}
                  d={`M ${x1} ${y1} C ${x1} ${y1 + 70}, ${x2} ${y2 - 70}, ${x2} ${y2}`}
                  stroke={isFlowing ? 'var(--gold)' : 'var(--border)'}
                  strokeWidth="2"
                  fill="none"
                  className={isFlowing ? 'circuit-path' : ''}
                  style={{ opacity: isFlowing ? 0.6 : 0.2 }}
                />
              );
            })}
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', position: 'relative', zIndex: 1 }}>
            {allNodes.map((node, index) => {
              const isCurrent = node.id === currentPositionNodeId;
              const isLocked = node.status === 'locked' && !isCurrent;
              const isMastered = node.status === 'mastered';
              const xOffset = getWindingOffset(index);

              return (
                <div 
                  key={node.id} 
                  ref={isCurrent ? currentPositionRef : null}
                  style={{ 
                    transform: `translateX(${xOffset}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNodeClick(node)}
                    className={`glass-panel ${isCurrent ? 'node-active-glow neon-border-gold' : (isMastered ? 'node-mastered-glow' : '')}`}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isLocked && fogOfWar === 'Strict' ? 'not-allowed' : 'pointer',
                      border: isMastered ? '2px solid #22c55e' : (isCurrent ? '2px solid var(--gold)' : '1px solid var(--border)'),
                      background: isLocked ? 'rgba(20,20,20,0.8)' : 'var(--surface)',
                      opacity: isLocked ? 0.3 : 1,
                      filter: isLocked && fogOfWar === 'Strict' ? 'blur(4px)' : 'none',
                      position: 'relative'
                    }}
                  >
                    {isLocked ? (
                      <Lock size={20} color="var(--text-muted)" />
                    ) : isMastered ? (
                      <Crown size={28} color="#22c55e" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))' }} />
                    ) : (
                      node.type === 'Checkpoint' ? <Sparkles size={28} color="var(--gold)" /> :
                      node.type === 'Drill' ? <Zap size={28} color="var(--gold)" /> :
                      <Brain size={28} color="var(--gold)" />
                    )}

                    {isCurrent && (
                      <div style={{ position: 'absolute', bottom: '-24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Map size={10} color="var(--gold)" />
                        <span style={{ fontSize: '0.5rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em' }}>ACTIVE</span>
                      </div>
                    )}
                  </motion.button>

                  <div style={{
                    marginTop: '28px',
                    textAlign: 'center',
                    width: '160px',
                    opacity: isLocked ? 0.3 : 1
                  }}>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 900, 
                      color: isCurrent ? 'white' : 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      lineHeight: 1.4
                    }}>
                      {node.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
