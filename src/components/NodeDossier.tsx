/* src/components/NodeDossier.tsx */
import React from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { CurriculumNode, VocabWord } from '../types/mastery';

interface Props {
  node: CurriculumNode;
  onBack: () => void;
  onAskLina: (p: string) => void;
}

export default function NodeDossier({ node, onBack, onAskLina }: Props) {
  const { vocabulary } = useMasteryStore();

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
        padding: '20px'
      }}
    >
      <header style={{ marginBottom: '24px' }}>
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
            marginBottom: '16px'
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

      <div className="dossier-body" style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
        {node.richContent?.map((block, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
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
        ))}
        {!node.richContent && <p style={{ color: '#666', fontStyle: 'italic' }}>Detailed dossier content pending decryption...</p>}
      </div>

      <footer style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
        <h4 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, marginBottom: '12px' }}>REQUIRED VOCABULARY</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {[...node.requiredVocabIds, ...node.requiredGrammarIds].map(id => {
            const vocab = vocabulary.find(v => v.id === id || v.word === id);
            return (
              <div key={id} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid #333', 
                borderRadius: '4px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '60px'
              }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>{vocab?.word || id}</span>
                <span style={{ color: '#666', fontSize: '0.55rem' }}>{vocab?.meanings?.split(',')[0] || '???'}</span>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => onAskLina(`toki jan Lina! I'm studying ${node.title}. Let's do a deep-dive practice session on this concept.`)}
          className="btn-review"
          style={{ width: '100%', margin: 0 }}
        >
          ✨ CONSULT JAN LINA
        </button>
      </footer>
    </motion.div>
  );
}
