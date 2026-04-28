/* src/components/CurriculumRoadmap.tsx */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import NodeDossier from './NodeDossier';
import ChallengeWidget from './ChallengeWidget';
import type { CurriculumNode, SessionLogEntry } from '../types/mastery';
import { STATUS_META } from '../types/mastery';

interface Props {
  onSetActiveView: (view: 'vocab' | 'roadmap' | 'phrasebook') => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export default function CurriculumRoadmap({ onSetActiveView, onAskLina, isSandboxMode }: Props) {
  const { curriculums, vocabulary, currentPositionNodeId, sessionLog } = useMasteryStore();
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const [hoveredSession, setHoveredSession] = useState<SessionLogEntry | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const currentPositionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPositionRef.current) {
      currentPositionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Flatten all nodes into a single sequence for the winding path
  const allNodes = useMemo(() => {
    return curriculums.flatMap(level => level.nodes);
  }, [curriculums]);

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

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'S': return 'var(--gold)';
      case 'A': return '#22c55e';
      case 'B': return '#3b82f6';
      case 'C': return '#666';
      default: return '#444';
    }
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

  // Unified Path Logic
  const unifiedPath = useMemo(() => {
    // Group sessions by node
    const sessionsByNodeId: Record<string, SessionLogEntry[]> = {};
    const generalSessions: SessionLogEntry[] = [];

    sessionLog.forEach(s => {
      if (s.curriculumNodeId && allNodes.some(n => n.id === s.curriculumNodeId)) {
        if (!sessionsByNodeId[s.curriculumNodeId]) sessionsByNodeId[s.curriculumNodeId] = [];
        sessionsByNodeId[s.curriculumNodeId].push(s);
      } else {
        generalSessions.push(s);
      }
    });

    // We build the path backwards from current to future, and backwards from current to past
    // Find index of current node
    const currentIndex = allNodes.findIndex(n => n.id === currentPositionNodeId);

    // Future
    const futureNodes = allNodes.slice(currentIndex).map(n => ({ type: 'node' as const, data: n }));

    // Past (mastered nodes and sessions)
    const past: (({ type: 'node', data: CurriculumNode } | { type: 'session', data: SessionLogEntry }))[] = [];

    for (let i = currentIndex - 1; i >= 0; i--) {
      const node = allNodes[i];
      past.push({ type: 'node', data: node });

      const nodeSessions = sessionsByNodeId[node.id];
      if (nodeSessions) {
        // Oldest first as you scroll up from current position
        [...nodeSessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(s => {
          past.push({ type: 'session', data: s });
        });
      }
    }

    // Add general sessions at the very top
    if (generalSessions.length > 0) {
      generalSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(s => {
        past.push({ type: 'session', data: s });
      });
    }

    return { past: past.reverse(), future: futureNodes, generalSessionsExist: generalSessions.length > 0 };
  }, [allNodes, sessionLog, currentPositionNodeId]);

  return (
    <div className="roadmap-container" style={{ 
      padding: '40px 0', 
      paddingBottom: '200px', 
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
      
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
        
        {/* Path Connector Line */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '2px', 
          zIndex: 0, 
          pointerEvents: 'none' 
        }}>
           <div style={{ position: 'absolute', top: 0, bottom: '50%', width: '100%', background: 'var(--gold)', opacity: 0.8 }} />
           <div style={{ position: 'absolute', top: '50%', bottom: 0, width: '100%', borderLeft: '2px dashed var(--gold)', opacity: 0.3 }} />
        </div>

        {/* PAST SECTION */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
          <div style={{ marginBottom: '-20px', width: '100%', padding: '0 40px' }}>
            <ChallengeWidget />
          </div>
          
          {unifiedPath.generalSessionsExist && (
            <div style={{ color: '#666', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em', marginTop: '20px' }}>GENERAL SESSIONS</div>
          )}

          {unifiedPath.past.map((item, index) => {
            const xOffset = getWindingOffset(index);
            
            if (item.type === 'session') {
              const session = item.data;
              return (
                <div 
                  key={session.id}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                  onMouseEnter={() => setHoveredSession(session)}
                  onMouseLeave={() => setHoveredSession(null)}
                  style={{ position: 'relative', zIndex: 1, left: xOffset }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: getGradeColor(session.grade),
                    border: '2px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: 'black',
                    cursor: 'help',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    {session.grade || '·'}
                  </div>

                  {hoveredSession === session && (
                    <div style={{
                      position: 'fixed',
                      top: mousePos.y - 120,
                      left: mousePos.x + 20,
                      background: 'rgba(5,5,5,0.95)',
                      border: '1px solid var(--gold)',
                      padding: '12px',
                      borderRadius: '4px',
                      zIndex: 1000,
                      width: '180px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      pointerEvents: 'none'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '4px' }}>{session.title}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '8px' }}>{new Date(session.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.7rem', marginBottom: '8px' }}>XP GAINED: <span style={{ color: 'var(--gold)', fontWeight: 800 }}>+{session.xpEarned}</span></div>
                      {session.wordsChanged.length > 0 && (
                        <div style={{ fontSize: '0.65rem' }}>
                          <div style={{ opacity: 0.5, marginBottom: '2px' }}>MOVED:</div>
                          {session.wordsChanged.slice(0,2).map(w => (
                            <div key={w.word}>{w.word} {STATUS_META[w.toStatus].emoji}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Node rendering
            const node = item.data;
            const mastery = calculateNodeMastery(node.requiredVocabIds || [], node.requiredGrammarIds || []);
            const masteryColor = getMasteryColor(mastery);

            return (
              <div key={node.id} style={{ position: 'relative', zIndex: 1, left: xOffset, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNodeClick(node)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    border: '2px solid var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>
                    {node.type === 'Checkpoint' ? '🏁' : (node.type === 'Drill' ? '⚡' : '🧠')}
                  </span>
                </motion.button>
                <div style={{ marginTop: '10px', fontSize: '0.6rem', fontWeight: 900, color: '#888', textAlign: 'center' }}>{node.title.toUpperCase()}</div>
              </div>
            );
          })}
        </div>

        {/* FUTURE SECTION */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
          {unifiedPath.future.map((item, index) => {
            const node = item.data;
            const mastery = calculateNodeMastery(node.requiredVocabIds || [], node.requiredGrammarIds || []);
            const isLocked = node.status === 'locked';
            const isMastered = node.status === 'mastered';
            const isActive = node.status === 'active';
            const isCurrent = node.id === currentPositionNodeId;

            const masteryColor = getMasteryColor(mastery);
            const xOffset = getWindingOffset(index + unifiedPath.past.length);

            return (
              <div 
                key={node.id} 
                ref={isCurrent ? currentPositionRef : null}
                style={{ 
                  position: 'relative', 
                  zIndex: 1, 
                  left: xOffset,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {isCurrent && (
                   <motion.div 
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    style={{ position: 'absolute', top: -25, color: 'var(--gold)', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em' }}
                   >
                     YOU ARE HERE
                   </motion.div>
                )}

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
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
