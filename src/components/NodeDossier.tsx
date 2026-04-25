/* src/components/NodeDossier.tsx */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  const { vocabulary } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const calculateMastery = () => {
    const allIds = [...node.requiredVocabIds, ...node.requiredGrammarIds];
    if (allIds.length === 0) return 0;
    const scores = allIds.map(id => {
      const word = vocabulary.find(v => v.id === id || v.word === id);
      return word ? word.baseScore : 0;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length / 10);
  };

  const mastery = calculateMastery();

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ 
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <header style={{ marginBottom: '24px', flexShrink: 0 }}>
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
            marginBottom: '16px',
            padding: 0
          }}
        >
          ← BACK TO ROADMAP
        </button>
        
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', marginBottom: '8px' }}>{node.title.toUpperCase()}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${mastery}%`, height: '100%', background: 'var(--gold)' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 900 }}>{mastery}% MASTERY</span>
        </div>
      </header>

      <div className="dossier-body" style={{ flex: 1, marginBottom: '24px' }}>
        {node.richContent?.map((block, i) => (
          <React.Fragment key={i}>
            <div style={{ marginBottom: '20px' }}>
              {block.type === 'text' && (
                <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6' }}>{block.content}</p>
              )}
              {block.type === 'structural' && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  borderLeft: '4px solid var(--gold)', 
                  padding: '16px',
                  borderRadius: '4px'
                }}>
                  <h4 style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '0.05em' }}>STRUCTURAL ANALYSIS</h4>
                  <p style={{ color: 'white', fontSize: '0.9rem', margin: 0 }}>{block.content}</p>
                </div>
              )}
              {block.type === 'callout' && (
                <div style={{ 
                  background: 'rgba(251, 191, 36, 0.1)', 
                  border: '1px solid var(--gold)', 
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <p style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{block.content}</p>
                </div>
              )}
            </div>
            {i === 0 && block.type === 'text' && node.visualFramework && (
              <img 
                src={node.visualFramework} 
                alt="Visual Framework" 
                style={{ 
                  width: '100%', 
                  maxWidth: '768px', 
                  borderRadius: '12px', 
                  border: '1px solid #374151', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', 
                  margin: '24px 0',
                  display: 'block'
                }} 
              />
            )}
          </React.Fragment>
        ))}
        {!node.richContent && <p style={{ color: '#666', fontStyle: 'italic' }}>Detailed dossier content pending decryption...</p>}
      </div>

      <footer style={{ borderTop: '1px solid #222', paddingTop: '20px', flexShrink: 0 }}>
        <h4 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, marginBottom: '12px' }}>NODE SANDBOX</h4>
        
        <VocabGrid 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode} 
          filterIds={node.requiredWordIds || node.requiredVocabIds} 
          hideToolbar={true}
        />

        <button 
          onClick={() => onAskLina(`toki jan Lina! I'm studying ${node.title}. Let's do a deep-dive practice session on this concept.`)}
          className="btn-review"
          style={{ 
            width: '100%', 
            margin: '20px 0 0 0',
            background: 'var(--gold)',
            color: 'black',
            fontWeight: 900,
            fontSize: '1rem',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          [ ✦ CONSULT LINA ]
        </button>
      </footer>

      <WordDetailDrawer
        isOpen={!!drawerId}
        word={drawerId ? vocabulary.find(v => v.id === drawerId) ?? null : null}
        onClose={() => setDrawerId(null)}
        onAskLina={onAskLina}
        isSandboxMode={isSandboxMode}
      />
    </motion.div>
  );
}

