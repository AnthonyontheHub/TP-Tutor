/* src/components/CurriculumRoadmap.tsx */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import NodeDossier from './NodeDossier';
import type { CurriculumNode, SessionLogEntry } from '../types/mastery';
import { STATUS_META } from '../types/mastery';
import InfoTooltip from './InfoTooltip';
import { HelpCircle } from 'lucide-react';

interface Props {
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  onLaunchActivity?: (nodeId: string, type: string) => void;
}

export default function CurriculumRoadmap({ onAskLina, isSandboxMode, onLaunchActivity }: Props) {
  const { curriculums, currentPositionNodeId, sessionLog, vocabulary } = useMasteryStore();
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const [hoveredSession, setHoveredSession] = useState<SessionLogEntry | null>(null);
  const [tappedSession, setTappedSession] = useState<SessionLogEntry | null>(null);

  const currentPositionRef = useRef<HTMLDivElement>(null);

  const getNodeIcon = (node: CurriculumNode): string => {
    if (node.type === 'Checkpoint') return '🏁';
    if (node.type === 'Drill') return '⚡';
    if (node.type === 'Concept') return '💡';
    if (node.type === 'Vocabulary') return '📖';
    if (node.type === 'Grammar') return '🔤';
    if (node.type === 'Culture') return '🌍';
    if (node.type === 'Review') return '🔄';
    return '🧠';
  };

  // Global Progress Calculation
  const globalMastery = useMemo(() => {
    if (vocabulary.length === 0) return 0;
    const totalPoints = vocabulary.reduce((acc, word) => {
      // Base score 0-1000
      let score = word.baseScore;
      // Exposure bonus: 10% of max value (100 points) if status is not 'not_started'
      if (word.status !== 'not_started') {
        score = Math.min(1000, score + 100);
      }
      return acc + score;
    }, 0);
    return Math.round((totalPoints / (vocabulary.length * 1000)) * 100);
  }, [vocabulary]);

  useEffect(() => {
    if (currentPositionRef.current) {
      currentPositionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentPositionNodeId]);

  // Helper to calculate mastery for a node
  const calculateNodeMastery = (node: CurriculumNode) => {
    const allIds = [...(node.requiredVocabIds || []), ...(node.requiredGrammarIds || [])];
    if (allIds.length === 0) {
       return node.status === 'mastered' ? 100 : 0;
    }
    const scores = allIds.map(id => {
      const word = vocabulary.find(v => v.id === id || v.word === id);
      return word ? word.baseScore : 0;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length / 10);
  };

  // Flatten all nodes into a single sequence for the winding path
  const allNodes = useMemo(() => {
    return curriculums.flatMap(level => level.nodes);
  }, [curriculums]);

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
    let currentIndex = allNodes.findIndex(n => n.id === currentPositionNodeId);
    if (currentIndex === -1) currentIndex = 0;

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

  const futureWithHeaders = useMemo(() => {
    const result: ({ type: 'header'; label: string } | { type: 'node'; data: CurriculumNode })[] = [];
    let lastLevelId: string | null = null;

    unifiedPath.future.forEach(item => {
      const levelForNode = curriculums.find(l => l.nodes.some(n => n.id === item.data.id));
      if (levelForNode && levelForNode.id !== lastLevelId) {
        result.push({ type: 'header', label: levelForNode.title || `Level ${levelForNode.id}` });
        lastLevelId = levelForNode.id;
      }
      result.push(item);
    });

    return result;
  }, [unifiedPath.future, curriculums]);

  const nextLockedNode = useMemo(() => {
    return unifiedPath.future.find(item => item.data.status === 'locked' && item.data.id !== currentPositionNodeId)?.data || null;
  }, [unifiedPath.future, currentPositionNodeId]);

  const nextLockedNodeItems = useMemo(() => {
    if (!nextLockedNode) return [];
    const allIds = [...(nextLockedNode.requiredVocabIds || []), ...(nextLockedNode.requiredGrammarIds || [])];
    return vocabulary.filter(v => allIds.includes(v.id) || allIds.includes(v.word))
      .filter(v => v.status !== 'mastered' && v.status !== 'confident')
      .slice(0, 3);
  }, [nextLockedNode, vocabulary]);

  return (
    <div 
      className="roadmap-container" 
      onClick={() => setTappedSession(null)}
      style={{ 
        padding: '40px 0', 
        paddingBottom: '200px', 
        position: 'relative',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <AnimatePresence>
        {selectedNode && (
          <NodeDossier 
            node={selectedNode} 
            onBack={() => setSelectedNode(null)} 
            onAskLina={onAskLina}
            isSandboxMode={isSandboxMode}
            onLaunchActivity={onLaunchActivity}
          />
        )}
      </AnimatePresence>

      <header style={{ textAlign: 'center', marginBottom: '60px', width: '100%', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <div title="Legend: Blue=Available, Gray=Locked, Gold=Mastered" style={{ cursor: 'help', color: '#666' }}><HelpCircle size={20} /></div>
        </div>
        <h1 style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.2em', margin: '0 0 20px 0' }}>NEURAL PATHWAY</h1>

        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={() => onLaunchActivity?.('training-pit', 'Drill')}
            className="btn-review"
            style={{ padding: '10px 24px', fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            ⚔️ THE TRAINING PIT
          </button>
        </div>

        <div style={{ maxWidth: '400px', margin: '0 auto 12px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900, letterSpacing: '0.1em' }}>TOTAL CURRICULUM MASTERY</span>
              <InfoTooltip text="Based on the combined scores of all required vocabulary across the entire map." />
            </div>
            <span style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: 900 }}>{globalMastery}%</span>
          </div>
          <div style={{ height: '6px', background: '#111', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${globalMastery}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }} 
            />
          </div>
        </div>

        <div style={{ color: '#666', fontSize: '0.7rem', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          SEQUENTIAL MASTERY MAP
          <InfoTooltip text="Tap a past session circle to view XP earned and specific words that changed status." />
        </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setTappedSession(prev => prev === session ? null : session);
                  }}
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

                  {(hoveredSession === session || tappedSession === session) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '60px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(5,5,5,0.97)',
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

            return (
              <div key={node.id} style={{ position: 'relative', zIndex: 1, left: xOffset, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNodeClick(node)}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '2px solid #22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: '0 0 12px rgba(34, 197, 94, 0.2)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    {getNodeIcon(node)}
                  </span>
                </motion.button>
                <div style={{ marginTop: '8px', fontSize: '0.55rem', fontWeight: 900, color: '#22c55e', textAlign: 'center', opacity: 0.7 }}>
                  {node.title.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* FUTURE SECTION */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
          {(() => {
            let nodeIndex = 0;
            return futureWithHeaders.map((item) => {
              if (item.type === 'header') {
                return (
                  <div key={`header-${item.label}`} style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '8px 20px',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'rgba(255,191,0,0.08)',
                      border: '1px solid rgba(255,191,0,0.3)',
                      borderRadius: '20px',
                      padding: '4px 16px',
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      color: 'var(--gold)',
                      letterSpacing: '0.15em'
                    }}>
                      {item.label.toUpperCase()}
                    </div>
                  </div>
                );
              }

              const node = item.data;
              const isCurrent = node.id === currentPositionNodeId;
              const isLocked = node.status === 'locked' && !isCurrent;
              const isMastered = node.status === 'mastered';
              const mastery = calculateNodeMastery(node);
              const masteryColor = 
                mastery >= 100 ? 'var(--gold)' :
                mastery >= 75  ? '#f59e0b' :
                mastery >= 50  ? '#3b82f6' :
                mastery >= 25  ? '#a855f7' :
                '#4b5563';
              const xOffset = getWindingOffset(nodeIndex + unifiedPath.past.length);
              nodeIndex++;

              return (
                <div key={node.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
                  <div 
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
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleNodeClick(node)}
                      style={{
                        width: isCurrent ? '80px' : '64px',
                        height: isCurrent ? '80px' : '64px',
                        borderRadius: '50%',
                        background: isLocked ? '#222' : (isMastered ? 'var(--gold)' : '#333'),
                        border: isCurrent ? '4px solid white' : `2px solid ${isLocked ? '#333' : 'var(--gold)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: isCurrent ? '0 0 20px var(--gold)' : 'none',
                        position: 'relative'
                      }}
                    >
                      {isLocked ? (
                        <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>🔒</span>
                      ) : (
                        <span style={{ fontSize: '1.5rem', filter: isMastered ? 'none' : 'grayscale(1)' }}>
                          {getNodeIcon(node)}
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
                            strokeDashoffset={100 - mastery}
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
                      {!isLocked && (
                        <>
                          <div style={{
                            fontSize: '0.55rem',
                            fontWeight: 900,
                            color: masteryColor,
                            letterSpacing: '0.08em',
                            marginTop: '2px'
                          }}>
                            {mastery}%
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '4px',
                            justifyContent: 'center',
                            marginTop: '4px',
                            fontSize: '0.8rem'
                          }}>
                            {node.suggestedMethod === 'Jan Lina Chat' && <span title="Chat">💬</span>}
                            {node.suggestedMethod === 'Builder Drill' && <span title="Drill">🔀</span>}
                            {(node.suggestedMethod === 'Quiz' || node.type === 'Checkpoint') && <span title="Quiz">📋</span>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {isCurrent && nextLockedNode && (
                    <div style={{
                      width: '85%',
                      background: 'rgba(168,85,247,0.06)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      textAlign: 'center',
                      zIndex: 2,
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#a855f7', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '6px' }}>
                        NEXT UNLOCK: {nextLockedNode.title.toUpperCase()}
                      </div>
                      {nextLockedNodeItems.length > 0 && (
                        <div style={{ fontSize: '0.6rem', color: '#888', fontWeight: 700 }}>
                          Focus on: {nextLockedNodeItems.map(w => w.word).join(' · ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

      </div>
    </div>
  );
}
