/* src/components/CurriculumRoadmap.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import NodeDossier from './NodeDossier';
import type { CurriculumNode } from '../types/mastery';

interface Props {
  onSetActiveView: (view: 'vocab' | 'roadmap' | 'phrasebook') => void;
  onAskLina: (p: string) => void;
}

export default function CurriculumRoadmap({ onSetActiveView, onAskLina }: Props) {
  const { levels, vocabulary, setLessonFilter } = useMasteryStore();
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);

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
    if (score >= 950) return 'var(--green)';
    if (score >= 751) return '#22c55e'; // Confident
    if (score >= 501) return 'var(--gold)'; // Practicing
    if (score >= 201) return '#3b82f6'; // Introduced
    return '#444'; // Not started
  };

  const handleNodeClick = (node: CurriculumNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="roadmap-container" style={{ padding: '20px 0', paddingBottom: '100px', position: 'relative' }}>
      <AnimatePresence>
        {selectedNode && (
          <NodeDossier 
            node={selectedNode} 
            onBack={() => setSelectedNode(null)} 
            onAskLina={onAskLina}
          />
        )}
      </AnimatePresence>

      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '24px', fontSize: '1.4rem', letterSpacing: '0.05em' }}>NEURAL PATHWAY ROADMAP</h1>
      
      {levels.map((level, sectorIdx) => (
        <div key={level.id} style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              background: 'var(--gold)', 
              color: 'black', 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.8rem'
            }}>
              {sectorIdx + 1}
            </div>
            <h2 style={{ fontSize: '1rem', color: 'white', fontWeight: 800, margin: 0 }}>
              {level.title.toUpperCase()}
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {level.nodes.map(node => {
              const mastery = calculateNodeMastery(node.requiredVocabIds, node.requiredGrammarIds);
              const masteryColor = getMasteryColor(mastery);
              
              return (
                <motion.div 
                  key={node.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNodeClick(node)}
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: `1px solid ${mastery > 200 ? masteryColor : 'var(--border)'}`, 
                    borderRadius: '8px',
                    boxShadow: mastery > 200 ? `0 0 15px ${masteryColor}22` : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div 
                      style={{ flex: 1 }}
                    >
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0', color: 'white' }}>{node.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${mastery/10}%`, height: '100%', background: masteryColor }} />
                        </div>
                        <span style={{ fontSize: '0.65rem', color: masteryColor, fontWeight: 800 }}>{Math.round(mastery/10)}% MASTERY</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onAskLina(`toki jan Lina! I'm working on the lesson "${node.title}". Can you give me a status report based on my current scores and a quick practice drill?`)}
                      style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold)',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                    >
                      CONSULT LINA
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {[...node.requiredVocabIds, ...node.requiredGrammarIds].map(id => (
                      <span key={id} style={{ 
                        fontSize: '0.55rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '2px 6px', 
                        borderRadius: '2px', 
                        color: '#888',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {id.replace('particle_', '').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
