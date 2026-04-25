/* src/components/NodeDossier.tsx */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { CurriculumNode, VocabWord } from '../types/mastery';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';

interface Props {
  node: CurriculumNode;
  onBack: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export default function NodeDossier({ node, onBack, onAskLina, isSandboxMode }: Props) {
  const { vocabulary, addWordToSelection, removeWordFromSelection, selectedWords } = useMasteryStore();
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

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.length === 0) {
      setDrawerId(word.id);
    } else {
      if (selectedWords.includes(word.word)) {
        removeWordFromSelection(word.word);
      } else {
        addWordToSelection(word.word);
      }
    }
  };

  const handleCardLongPress = (word: VocabWord) => {
    addWordToSelection(word.word);
  };

  const nodeWords = vocabulary.filter(v => 
    node.requiredVocabIds.includes(v.id) || 
    node.requiredVocabIds.includes(v.word) ||
    node.requiredGrammarIds.includes(v.id) ||
    node.requiredGrammarIds.includes(v.word)
  );

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

      <footer style={{ borderTop: '1px solid #222', paddingTop: '20px', flexShrink: 0 }}>
        <h4 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, marginBottom: '12px' }}>THE SANDBOX</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
          gap: '8px', 
          marginBottom: '20px' 
        }}>
          {nodeWords.map(word => {
            const positions: number[] = [];
            selectedWords.forEach((w, i) => { if (w === word.word) positions.push(i + 1); });
            
            return (
              <div key={word.id} style={{ position: 'relative' }}>
                <VocabCard 
                  word={word} 
                  onClick={handleCardClick}
                  onLongPress={handleCardLongPress}
                />
                {positions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2px',
                    justifyContent: 'flex-end',
                    maxWidth: '40px',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}>
                    {positions.map(pos => (
                      <span key={pos} style={{
                        background: 'var(--gold)',
                        color: 'black',
                        borderRadius: '50%',
                        width: '14px',
                        height: '14px',
                        fontSize: '0.5rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid black'
                      }}>{pos}</span>
                    ))}
                  </div>
                )}
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
